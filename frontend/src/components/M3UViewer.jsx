import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';

// Make sure to import the PrimeReact CSS files in your App.jsx, not here
// import "primereact/resources/themes/lara-dark-blue/theme.css";
// import "primereact/resources/primereact.min.css";
// import "primeicons/primeicons.css";
// import "primeflex/primeflex.css";

const M3UViewer = () => {
    // Toast reference
    const toastRef = useRef(null);

    // State management
    const [channels, setChannels] = useState([]);
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [exportDialog, setExportDialog] = useState(false);
    const [exportFilename, setExportFilename] = useState('channels.m3u');
    const [originalContent, setOriginalContent] = useState('');
    const [rows, setRows] = useState(20);
    const fileInputRef = useRef(null);

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
        if (toastRef.current) {
            toastRef.current.show({
                severity,
                summary,
                detail,
                life: 3000
            });
        }
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
                    original_content: originalContent
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
        <div className="card p-4">
            <Toast ref={toastRef} />
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
                <div className="field">
                    <label htmlFor="filename" className="font-bold block mb-2">
                        Filename
                    </label>
                    <div className="p-inputgroup">
                        <InputText
                            id="filename"
                            value={exportFilename}
                            onChange={(e) => setExportFilename(e.target.value)}
                            placeholder="Enter filename"
                            autoFocus
                        />
                        <span className="p-inputgroup-addon">.m3u</span>
                    </div>
                    <small className="text-gray-500">
                        Selected channels: {selectedChannels.length}
                    </small>
                </div>
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
                tableStyle={{ minWidth: '50rem' }}
                scrollHeight="calc(100vh - 200px)"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} frozen />
                <Column 
                    field="name" 
                    header="Name" 
                    sortable 
                    filter 
                    showFilterMenu={false}
                    filterElement={() => (
                        <InputText
                            value={nameFilter}
                            onChange={(e) => onFilterChange(e, 'name')}
                            placeholder="Search name..."
                            className="w-full"
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
                    filterElement={() => (
                        <Dropdown
                            value={groupFilter}
                            options={uniqueGroups}
                            onChange={(e) => onGroupFilterChange(e.value)}
                            placeholder="Select group"
                            className="w-full"
                            showClear
                        />
                    )}
                    body={(rowData) => (
                        <Tag value={rowData.group} severity="info" rounded />
                    )}
                />
                <Column 
                    field="tvg_id" 
                    header="ID" 
                    sortable 
                    filter
                    showFilterMenu={false}
                    filterElement={() => (
                        <InputText
                            value={idFilter}
                            onChange={(e) => onFilterChange(e, 'tvg_id')}
                            placeholder="Search ID..."
                            className="w-full"
                        />
                    )}
                />
                <Column 
                    field="tvg_logo" 
                    header="Logo" 
                    body={(rowData) => (
                        rowData.tvg_logo ? (
                            <img
                                src={rowData.tvg_logo}
                                alt={`${rowData.name} logo`}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    e.target.src = "/api/placeholder/32/32";
                                }}
                            />
                        ) : null
                    )}
                />
            </DataTable>
        </div>
    );
};

export default M3UViewer;