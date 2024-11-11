import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';

function M3UViewer() {
    const toast = useRef(null);
    const fileInputRef = useRef(null);

    // State management
    const [channels, setChannels] = useState([]);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [exportDialog, setExportDialog] = useState(false);
    const [exportFilename, setExportFilename] = useState('channels.m3u');
    const [originalContent, setOriginalContent] = useState('');
    const [rows, setRows] = useState(20);
    const [editingRows, setEditingRows] = useState({});
    const [modifiedChannels, setModifiedChannels] = useState({});
    
    // Filter states
    const [filters, setFilters] = useState({
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        group: { value: null, matchMode: FilterMatchMode.EQUALS },
        tvg_id: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [nameFilter, setNameFilter] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [idFilter, setIdFilter] = useState('');

    const showToast = (severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({
                severity,
                summary,
                detail,
                life: 3000
            });
        }
    };

    const onRowEditComplete = (e) => {
        let { newData, index } = e;
        let _channels = [...channels];
        _channels[index] = newData;
        
        setModifiedChannels(prev => ({
            ...prev,
            [index]: newData
        }));
        
        setChannels(_channels);
        showToast('success', 'ID Updated', `Channel ID updated to: ${newData.tvg_id}`);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalContent(e.target.result);
            };
            reader.readAsText(file);

            const response = await fetch('http://localhost:8000/parse', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setChannels(data.channels);
            showToast('success', 'File Loaded', `Successfully loaded ${data.channels.length} channels`);
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('error', 'Error', `Failed to load M3U file: ${error.message}`);
        }
        event.target.value = '';
    };

    const handleExport = async () => {
        if (!selectedChannels.length) {
            showToast('warn', 'No Selection', 'Please select channels to export');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    indices: selectedChannels.map(channel => channel.index),
                    original_content: originalContent,
                    modified_channels: modifiedChannels
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = exportFilename.toLowerCase().endsWith('.m3u') 
                ? exportFilename 
                : `${exportFilename}.m3u`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setExportDialog(false);
            showToast('success', 'Export Complete', `Exported ${selectedChannels.length} channels`);
        } catch (error) {
            console.error('Error exporting selection:', error);
            showToast('error', 'Export Failed', error.message);
        }
    };

    const onFilterChange = (e, field) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters[field].value = value;
        setFilters(_filters);

        switch (field) {
            case 'name':
                setNameFilter(value);
                break;
            case 'tvg_id':
                setIdFilter(value);
                break;
        }
    };

    const onGroupFilterChange = (value) => {
        let _filters = { ...filters };
        _filters['group'].value = value;
        setFilters(_filters);
        setGroupFilter(value);
    };

    const uniqueGroups = channels
        .map(channel => channel.group)
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .sort()
        .map(group => ({ label: group, value: group }));

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="flex align-items-center gap-4">
                <h1 className="text-2xl font-bold m-0">M3U File Viewer</h1>
                {channels.length > 0 && (
                    <Tag severity="info" value={`${channels.length} channels`} rounded />
                )}
            </div>
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-upload" 
                    label="Upload M3U" 
                    onClick={() => fileInputRef.current.click()}
                    severity="secondary"
                />
                <Button
                    icon="pi pi-download"
                    label={`Export (${selectedChannels.length})`}
                    disabled={!selectedChannels.length}
                    onClick={() => setExportDialog(true)}
                    severity="success"
                />
            </div>
        </div>
    );
    return (
      // Remove padding and make container full width
      <div className="w-screen h-screen">
          <Toast ref={toast} />
          <input
              ref={fileInputRef}
              type="file"
              accept=".m3u,.m3u8"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
          />
          
          <Dialog 
              header="Export Channels" 
              visible={exportDialog} 
              onHide={() => setExportDialog(false)}
              footer={(
                  <div>
                      <Button 
                          label="Cancel" 
                          icon="pi pi-times" 
                          onClick={() => setExportDialog(false)} 
                          className="p-button-text"
                      />
                      <Button 
                          label="Export" 
                          icon="pi pi-download" 
                          onClick={handleExport} 
                          autoFocus 
                          severity="success"
                      />
                  </div>
              )}
              modal
              style={{ width: '450px' }}
              className="p-fluid"
          >
              {/* ... Dialog content remains the same ... */}
          </Dialog>

          <DataTable
              value={channels}
              selection={selectedChannels}
              onSelectionChange={(e) => setSelectedChannels(e.value)}
              dataKey="index"
              header={header}
              filters={filters}
              filterDisplay="row"
              stripedRows
              showGridlines
              paginator
              rows={rows}
              rowsPerPageOptions={[20, 50, 100]}
              scrollHeight="calc(100vh - 120px)"
              editMode="row"
              editingRows={editingRows}
              onRowEditComplete={onRowEditComplete}
              onRowEditChange={(e) => setEditingRows(e.data)}
              size="small"
              style={{ 
                  '--data-table-row-height': '2.5rem',
                  '--data-table-header-height': '2.75rem'
              }}
              className="w-full" // Make table full width
              tableStyle={{ width: '100%', margin: 0 }} // Remove margins
          >
              <Column 
                  selectionMode="multiple" 
                  headerStyle={{ width: '3rem', padding: '0.5rem' }}
                  bodyStyle={{ padding: '0.5rem' }}
                  frozen 
              />
              <Column 
                  field="name" 
                  header="Name" 
                  sortable 
                  filter 
                  showFilterMenu={false}
                  headerStyle={{ padding: '0.5rem', width: '25%' }} // Set width for name column
                  bodyStyle={{ padding: '0.5rem' }}
                  filterElement={() => (
                      <InputText
                          value={nameFilter}
                          onChange={(e) => onFilterChange(e, 'name')}
                          placeholder="Search name..."
                          className="w-full h-8"
                      />
                  )}
                  frozen
              />
              <Column 
                  field="group" 
                  header="Group" 
                  sortable 
                  filter
                  showFilterMenu={false}
                  headerStyle={{ padding: '0.5rem', width: '15%' }} // Set width for group column
                  bodyStyle={{ padding: '0.5rem' }}
                  filterElement={() => (
                      <Dropdown
                          value={groupFilter}
                          options={uniqueGroups}
                          onChange={(e) => onGroupFilterChange(e.value)}
                          placeholder="Select group"
                          className="w-full h-8"
                          showClear
                      />
                  )}
                  body={(rowData) => (
                      <Tag 
                          value={rowData.group} 
                          severity="info" 
                          rounded
                          className="text-xs py-1 px-2"
                      />
                  )}
              />
              <Column 
                  field="tvg_id" 
                  header="ID" 
                  sortable 
                  filter
                  showFilterMenu={false}
                  headerStyle={{ padding: '0.5rem', width: '45%' }} // Set width for ID column
                  bodyStyle={{ padding: '0.5rem' }}
                  filterElement={() => (
                      <InputText
                          value={idFilter}
                          onChange={(e) => onFilterChange(e, 'tvg_id')}
                          placeholder="Search ID..."
                          className="w-full h-8"
                      />
                  )}
                  editor={(options) => (
                      <InputText
                          value={options.value}
                          onChange={(e) => options.editorCallback(e.target.value)}
                          className="w-full"
                      />
                  )}
              />
              <Column 
                  field="tvg_logo" 
                  header="Logo"
                  headerStyle={{ padding: '0.5rem', width: '10%' }} // Set width for logo column
                  bodyStyle={{ padding: '0.5rem', textAlign: 'center' }} 
                  body={(rowData) => (
                      rowData.tvg_logo ? (
                          <img
                              src={rowData.tvg_logo}
                              alt={`${rowData.name} logo`}
                              className="w-6 h-6 object-contain inline-block"
                              onError={(e) => {
                                  e.target.src = "/api/placeholder/24/24";
                              }}
                          />
                      ) : null
                  )}
              />
              <Column
                  rowEditor
                  headerStyle={{ width: '5%', padding: '0.5rem' }}
                  bodyStyle={{ padding: '0.5rem' }}
              />
          </DataTable>
      </div>
  );

}

export default M3UViewer;