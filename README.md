# M3U File Viewer

A modern web application for viewing, filtering, and managing M3U playlist files. Built with React and FastAPI, featuring a responsive dark-themed interface.

![image](https://github.com/user-attachments/assets/7f299ad9-d513-4516-bd8a-87612f3c73ed)

## Features

- 📁 Upload and parse M3U/M3U8 playlist files
- 🔍 Real-time search and filtering capabilities
- 📋 Multi-select channels for export
- ⚡ Fast and responsive interface
- 🌗 Dark theme interface
- 📱 Responsive design
- 🔄 Sort by name, group, or ID
- 💾 Export selected channels to new M3U file
- 🏷️ Group-based filtering
- 🖼️ Channel logo display

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/m3u-viewer.git
cd m3u-viewer
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install backend dependencies
cd backend
pip install fastapi uvicorn python-multipart
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server (from the backend directory):
```bash
uvicorn main:app --reload
```
The backend will be available at `http://localhost:8000`

2. Start the frontend development server (from the frontend directory):
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

## Usage

1. **Upload a Playlist**
   - Click the "Upload M3U" button
   - Select your M3U/M3U8 file
   - The file will be parsed and displayed in the table

2. **Filter Channels**
   - Use the search box under "Name" to filter by channel name
   - Use the dropdown under "Group" to filter by channel group
   - Use the search box under "ID" to filter by channel ID

3. **Sort Channels**
   - Click on column headers to sort by that column
   - Click again to reverse sort order

4. **Export Selected Channels**
   - Select channels using the checkboxes
   - Click "Export" button
   - Enter a filename in the dialog
   - Click "Export" to save the new M3U file

## Project Structure

```
m3u-viewer/
├── backend/
│   └── main.py        # FastAPI backend server
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── M3UViewer.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Technologies Used

### Backend
- FastAPI
- Python
- uvicorn
- python-multipart

### Frontend
- React
- PrimeReact
- Tailwind CSS
- Vite

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to the branch
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

## API Endpoints

The backend provides the following endpoints:

- `POST /parse` - Upload and parse M3U file
- `POST /export` - Export selected channels to new M3U file

## Common Issues

1. **CORS Errors**
   - Ensure both backend and frontend servers are running
   - Check that the backend CORS settings match your frontend URL

2. **File Upload Issues**
   - Verify file format is .m3u or .m3u8
   - Check file size and content format

3. **Export Issues**
   - Ensure at least one channel is selected
   - Verify you have write permissions in the download directory

## Future Improvements

- [ ] Add playlist validation
- [ ] Implement channel editing
- [ ] Add bulk operations
- [ ] Support for multiple playlists
- [ ] Add playlist preview functionality
- [ ] Support for different playlist formats
- [ ] Add user preferences storage

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- PrimeReact for the UI components
- FastAPI for the backend framework
- The IPTV community for inspiration

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/m3u-viewer](https://github.com/yourusername/m3u-viewer)
