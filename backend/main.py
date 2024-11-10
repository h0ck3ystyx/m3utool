from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import re
from pathlib import Path
import tempfile

class Channel(BaseModel):
    name: str
    group: str
    tvg_id: str = ""
    tvg_name: str = ""
    tvg_logo: str = ""
    url: str
    raw_info: str
    index: int

class ExportRequest(BaseModel):
    indices: List[int]
    original_content: str

class M3UParser:
    def __init__(self):
        self.channels = []
        
    def parse(self, content: str):
        lines = content.split('\n')
        current_channel = None
        index = 0
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.startswith('#EXTINF:'):
                # Parse channel info
                info = line
                name = re.search('tvg-name="([^"]*)"', line)
                group = re.search('group-title="([^"]*)"', line)
                tvg_id = re.search('tvg-id="([^"]*)"', line)
                tvg_logo = re.search('tvg-logo="([^"]*)"', line)
                
                # Get channel name (last part after comma)
                display_name = line.split(',')[-1] if ',' in line else ""
                
                current_channel = {
                    'name': display_name,
                    'group': group.group(1) if group else "",
                    'tvg_id': tvg_id.group(1) if tvg_id else "",
                    'tvg_name': name.group(1) if name else "",
                    'tvg_logo': tvg_logo.group(1) if tvg_logo else "",
                    'raw_info': info,
                    'index': index
                }
                
            elif line.startswith('http'):
                if current_channel:
                    current_channel['url'] = line
                    self.channels.append(Channel(**current_channel))
                    current_channel = None
                    index += 1
                    
        return self.channels

    def export_selection(self, indices: List[int], original_content: str) -> str:
        lines = original_content.split('\n')
        selected_content = ['#EXTM3U']
        current_index = 0
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            if line.startswith('#EXTINF:'):
                if current_index in indices:
                    selected_content.append(line)
                    if i + 1 < len(lines):
                        selected_content.append(lines[i + 1].strip())
                current_index += 1
            i += 1
            
        return '\n'.join(selected_content)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/parse")
async def parse_m3u(file: UploadFile = File(...)):
    content = await file.read()
    parser = M3UParser()
    try:
        channels = parser.parse(content.decode())
        return {"channels": channels}
    except Exception as e:
        print(f"Error parsing M3U: {str(e)}")  # Debug log
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/export")
async def export_selection(request: ExportRequest):
    parser = M3UParser()
    try:
        content = parser.export_selection(request.indices, request.original_content)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.m3u', mode='w') as tmp:
            tmp.write(content)
            tmp_path = tmp.name
            
        return FileResponse(
            tmp_path,
            media_type='application/x-mpegurl',
            filename='selected_channels.m3u'
        )
    except Exception as e:
        print(f"Error exporting M3U: {str(e)}")  # Debug log
        raise HTTPException(status_code=400, detail=str(e))