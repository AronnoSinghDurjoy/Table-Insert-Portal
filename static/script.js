/**
 * Mela SIM Sell Portal - JavaScript
 * Handles form submission, searchable dropdowns, and data display
 */

const API_BASE_URL = '/api';

let zonesData = [];
let officersData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeRetailerDropdown();
    loadZones();
    loadFieldOfficers();
    loadRecentRecords();
    setupEventListeners();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Form submission
    document.getElementById('simSellForm').addEventListener('submit', handleFormSubmit);
    
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadRecentRecords);
    
    // Download template button
    document.getElementById('downloadTemplateBtn').addEventListener('click', downloadTemplate);
    
    // Upload button
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('bulkUploadFile').click();
    });
    
    // File upload handler
    document.getElementById('bulkUploadFile').addEventListener('change', handleFileUpload);
    
    // Zone search
    const zoneSearch = document.getElementById('zoneSearch');
    zoneSearch.addEventListener('input', () => {
        if (zoneSearch.value.trim() === '') {
            // If empty, show all zones
            populateDropdown('zone', zonesData);
        } else {
            // Filter based on input
            filterDropdown('zone', zoneSearch.value);
        }
    });
    zoneSearch.addEventListener('focus', () => {
        // Show all zones on focus if field is empty
        if (zoneSearch.value.trim() === '') {
            showDropdown('zone');
        } else {
            // If has value, filter
            filterDropdown('zone', zoneSearch.value);
        }
    });
    
    // Officer search
    const officerSearch = document.getElementById('officerSearch');
    officerSearch.addEventListener('input', () => {
        if (officerSearch.value.trim() === '') {
            // If empty, show all officers
            populateDropdown('officer', officersData);
        } else {
            // Filter based on input
            filterDropdown('officer', officerSearch.value);
        }
    });
    officerSearch.addEventListener('focus', () => {
        // Show all officers on focus if field is empty
        if (officerSearch.value.trim() === '') {
            showDropdown('officer');
        } else {
            // If has value, filter
            filterDropdown('officer', officerSearch.value);
        }
    });
    
    // MSISDN validation
    let msisdnCheckTimeout;
    const msisdnInput = document.getElementById('msisdn');
    
    msisdnInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '').substring(0, 10);
        
        // Clear previous timeout
        clearTimeout(msisdnCheckTimeout);
        
        // Validate must start with 15
        if (this.value.length >= 2 && !this.value.startsWith('15')) {
            showMsisdnWarning('⚠️ MSISDN must start with 15');
            return;
        }
        
        // Hide warning if input is incomplete
        if (this.value.length < 10) {
            hideMsisdnWarning();
            return;
        }
        
        // Check if MSISDN exists after user stops typing (500ms delay)
        msisdnCheckTimeout = setTimeout(() => {
            checkMsisdnExists(this.value);
        }, 500);
    });
    
    // New SIM and Replace mutual exclusion logic
    const newSimSelect = document.getElementById('new_sim');
    const replaceSelect = document.getElementById('replace');
    
    newSimSelect.addEventListener('change', function() {
        if (this.value === 'YES') {
            replaceSelect.value = 'NO';
        }
    });
    
    replaceSelect.addEventListener('change', function() {
        if (this.value === 'YES') {
            newSimSelect.value = 'NO';
        }
    });
    
    // Download Excel button
    document.getElementById('downloadExcelBtn').addEventListener('click', downloadTableData);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select')) {
            hideAllDropdowns();
        }
    });
}

/**
 * Initialize retailer count dropdown (0-99)
 */
function initializeRetailerDropdown() {
    const select = document.getElementById('new_retailer_count');
    for (let i = 0; i <= 99; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }
}

/**
 * Load zones from API
 */
async function loadZones() {
    try {
        const response = await fetch(`${API_BASE_URL}/zones`);
        const result = await response.json();
        
        if (result.success) {
            zonesData = result.data;
            populateDropdown('zone', zonesData);
        } else {
            console.error('Failed to load zones:', result.error);
        }
    } catch (error) {
        console.error('Error loading zones:', error);
    }
}

/**
 * Load field officers from API
 */
async function loadFieldOfficers() {
    try {
        const response = await fetch(`${API_BASE_URL}/field-officers`);
        const result = await response.json();
        
        if (result.success) {
            officersData = result.data;
            populateDropdown('officer', officersData);
        } else {
            console.error('Failed to load field officers:', result.error);
        }
    } catch (error) {
        console.error('Error loading field officers:', error);
    }
}

/**
 * Populate searchable dropdown
 */
function populateDropdown(type, data) {
    const dropdownId = type === 'zone' ? 'zoneDropdown' : 'officerDropdown';
    const dropdown = document.getElementById(dropdownId);
    
    dropdown.innerHTML = '';
    
    if (data.length === 0) {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = 'No options available';
        div.style.color = '#999';
        dropdown.appendChild(div);
        return;
    }
    
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = item;
        div.addEventListener('click', () => selectDropdownItem(type, item));
        dropdown.appendChild(div);
    });
}

/**
 * Filter dropdown based on search input
 */
function filterDropdown(type, searchText) {
    const data = type === 'zone' ? zonesData : officersData;
    const filtered = data.filter(item => 
        item.toLowerCase().includes(searchText.toLowerCase())
    );
    populateDropdown(type, filtered);
    
    // Show dropdown when filtering
    const dropdownId = type === 'zone' ? 'zoneDropdown' : 'officerDropdown';
    document.getElementById(dropdownId).style.display = 'block';
}

/**
 * Show dropdown
 */
function showDropdown(type) {
    // First, hide all dropdowns
    hideAllDropdowns();
    
    const dropdownId = type === 'zone' ? 'zoneDropdown' : 'officerDropdown';
    const dropdown = document.getElementById(dropdownId);
    
    // Repopulate with full data when showing
    if (type === 'zone') {
        populateDropdown('zone', zonesData);
    } else {
        populateDropdown('officer', officersData);
    }
    
    dropdown.style.display = 'block';
}

/**
 * Hide all dropdowns
 */
function hideAllDropdowns() {
    document.getElementById('zoneDropdown').style.display = 'none';
    document.getElementById('officerDropdown').style.display = 'none';
}

/**
 * Select item from dropdown
 */
function selectDropdownItem(type, value) {
    if (type === 'zone') {
        document.getElementById('zoneSearch').value = value;
    } else {
        document.getElementById('officerSearch').value = value;
    }
    hideAllDropdowns();
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        zone: document.getElementById('zoneSearch').value,
        field_officer: document.getElementById('officerSearch').value,
        btsid: document.getElementById('btsid').value,
        msisdn: document.getElementById('msisdn').value,
        entry_date: document.getElementById('entry_date').value,
        new_sim: document.getElementById('new_sim').value,
        replace: document.getElementById('replace').value,
        new_retailer_count: document.getElementById('new_retailer_count').value
    };
    
    // Validate all fields are filled
    for (const [key, value] of Object.entries(formData)) {
        if (!value) {
            showMessage(`Please fill in ${key.replace('_', ' ')}`, 'error');
            return;
        }
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Data submitted successfully!', 'success');
            document.getElementById('simSellForm').reset();
            document.getElementById('zoneSearch').value = '';
            document.getElementById('officerSearch').value = '';
            loadRecentRecords();
        } else {
            showMessage(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
    }
}

/**
 * Load recent records
 */
async function loadRecentRecords() {
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '<tr><td colspan="10" class="loading">Loading records...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/records?limit=50`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = '';
            result.data.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.ID}</td>
                    <td>${record.ZONE}</td>
                    <td>${record.FIELD_OFFICER}</td>
                    <td>${record.BTSID}</td>
                    <td>${record.MSISDN}</td>
                    <td>${record.ENTRY_DATE || 'N/A'}</td>
                    <td>${record.NEW_SIM}</td>
                    <td>${record.REPLACE_SIM}</td>
                    <td>${record.NEW_RETAILER_COUNT}</td>
                    <td>${record.CREATED_DATE}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="10" class="no-data">No records found (Database not connected - data will be saved when deployed to server)</td></tr>';
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="10" class="no-data">Database not connected - Running in local mode. Records will be saved when deployed to server.</td></tr>`;
    }
}

/**
 * Check if MSISDN already exists in database
 */
async function checkMsisdnExists(msisdn) {
    try {
        const response = await fetch(`${API_BASE_URL}/check-msisdn/${msisdn}`);
        const result = await response.json();
        
        if (result.exists) {
            showMsisdnWarning(`⚠️ This MSISDN already exists in the database!`);
        } else {
            hideMsisdnWarning();
        }
    } catch (error) {
        console.error('Error checking MSISDN:', error);
    }
}

/**
 * Show MSISDN warning message
 */
function showMsisdnWarning(message) {
    const warning = document.getElementById('msisdnWarning');
    const input = document.getElementById('msisdn');
    const help = document.getElementById('msisdnHelp');
    
    warning.textContent = message;
    warning.style.display = 'block';
    warning.className = 'msisdn-warning error';
    input.classList.add('msisdn-exists');
    help.style.display = 'none';
}

/**
 * Hide MSISDN warning message
 */
function hideMsisdnWarning() {
    const warning = document.getElementById('msisdnWarning');
    const input = document.getElementById('msisdn');
    const help = document.getElementById('msisdnHelp');
    
    warning.style.display = 'none';
    input.classList.remove('msisdn-exists');
    help.style.display = 'block';
}

/**
 * Show message to user
 */
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

/**
 * Download Excel template
 */
async function downloadTemplate() {
    try {
        const response = await fetch(`${API_BASE_URL}/download-template`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Mela_SIM_Upload_Template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage('Template downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading template:', error);
        showMessage('Failed to download template', 'error');
    }
}

/**
 * Handle file upload
 */
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show file name
    document.getElementById('fileName').textContent = file.name;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        showMessage('Uploading file...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/bulk-upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const message = `Successfully uploaded ${result.inserted} records!`;
            showMessage(message, 'success');
            showSuccessPopup(result.inserted, result.errors);
            loadRecentRecords();
            // Reset file input
            e.target.value = '';
            document.getElementById('fileName').textContent = '';
        } else {
            showMessage(`Upload failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        showMessage('Failed to upload file', 'error');
    }
}

/**
 * Show success popup after bulk upload
 */
function showSuccessPopup(insertedCount, errors) {
    let popupContent = `
        <div class="popup-overlay" id="successPopup">
            <div class="popup-content">
                <div class="popup-icon">✓</div>
                <h3>Upload Successful!</h3>
                <p><strong>${insertedCount}</strong> records uploaded successfully.</p>
    `;
    
    if (errors && errors.length > 0) {
        popupContent += `
                <div class="popup-errors">
                    <p><strong>Errors (${errors.length}):</strong></p>
                    <ul>
        `;
        errors.slice(0, 5).forEach(error => {
            popupContent += `<li>${error}</li>`;
        });
        if (errors.length > 5) {
            popupContent += `<li>... and ${errors.length - 5} more errors</li>`;
        }
        popupContent += `
                    </ul>
                </div>
        `;
    }
    
    popupContent += `
                <button onclick="closeSuccessPopup()" class="popup-btn">OK</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupContent);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeSuccessPopup();
    }, 5000);
}

/**
 * Close success popup
 */
function closeSuccessPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) {
        popup.remove();
    }
}

/**
 * Download table data as Excel
 */
async function downloadTableData() {
    try {
        const response = await fetch(`${API_BASE_URL}/download-records`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        a.download = `Mela_SIM_Records_${timestamp}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage('Records downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading records:', error);
        showMessage('Failed to download records', 'error');
    }
}
