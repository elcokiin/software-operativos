export const $ = (selector) => document.querySelector(selector)
export const $$ = (selector) => document.querySelectorAll(selector)

export const generateTableProcess = (listOfProcesses) => {
    const gridBody = $('.grid-body');
    
    // Clear existing rows
    gridBody.innerHTML = '';
    
    // Generate new rows
    listOfProcesses.forEach((process, index) => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        
        // PID cell
        const pidCell = document.createElement('div');
        pidCell.className = 'grid-cell';
        const pidInput = document.createElement('input');
        pidInput.className = 'input-table';
        pidInput.type = 'text';
        pidInput.value = process.pid || process.name;
        pidInput.readOnly = true; // PID should not be editable
        pidCell.appendChild(pidInput);
        row.appendChild(pidCell);
        
        // Execution time cell
        const timeCell = document.createElement('div');
        timeCell.className = 'grid-cell';
        const timeInput = document.createElement('input');
        timeInput.className = 'input-table';

        timeInput.type = 'number';
        timeInput.value = process.time || '';
        timeInput.min = 1;
        timeCell.appendChild(timeInput);
        row.appendChild(timeCell);
        
        // Blocked status cell
        const blockedCell = document.createElement('div');
        blockedCell.className = 'grid-cell';
        const blockSelect = document.createElement('select');
        blockSelect.className = 'input-table';
        
        const yesOption = document.createElement('option');
        yesOption.value = 'yes';
        yesOption.textContent = 'Sí';
        
        const noOption = document.createElement('option');
        noOption.value = 'no';
        noOption.textContent = 'No';
        
        blockSelect.appendChild(yesOption);
        blockSelect.appendChild(noOption);
        blockSelect.value = process.block === 'yes' || process.block === true ? 'yes' : 'no';
        
        blockedCell.appendChild(blockSelect);
        row.appendChild(blockedCell);
        
        // Actions cell
        const actionsCell = document.createElement('div');
        actionsCell.className = 'grid-cell actions-cell';
        
        const actionsList = document.createElement('ul');
        actionsList.className = 'dropdown-content';
        
        const updateAction = document.createElement('li');
        updateAction.className = 'action update-process';
        updateAction.textContent = 'Actualizar';
        updateAction.dataset.pid = process.pid || process.name;
        updateAction.addEventListener('click', () => {
            // Get values from inputs
            const time = parseInt(timeInput.value) || process.time;
            const block = blockSelect.value === 'yes';
            
            // Update the process in listOfProcesses
            listOfProcesses[index].time = time;
            listOfProcesses[index].block = block;
            
            window.electronAPI.showInfoDialog(`Proceso ${process.pid || process.name} actualizado`);
        });
        
        const deleteAction = document.createElement('li');
        deleteAction.className = 'action delete-process';
        deleteAction.textContent = 'Borrar';
        deleteAction.dataset.pid = process.pid || process.name;
        deleteAction.addEventListener('click', () => {
            // Remove the process from listOfProcesses
            listOfProcesses.splice(index, 1);
            
            // Regenerate the table
            generateTableProcess(listOfProcesses);
            
            window.electronAPI.showInfoDialog(`Proceso ${process.pid || process.name} eliminado`);
        });
        
        actionsList.appendChild(updateAction);
        actionsList.appendChild(deleteAction);
        actionsCell.appendChild(actionsList);
        row.appendChild(actionsCell);
        
        gridBody.appendChild(row);
    });
}

export const generateTableExecProcess = (historyProcesses) => {
    const gridBody = $('#process-grid-body');
    
    // Clear existing rows
    gridBody.innerHTML = '';
    
    // Generate new rows
    historyProcesses.forEach((process) => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        
        // PID cell
        const pidCell = document.createElement('div');
        pidCell.className = 'grid-cell';
        pidCell.textContent = process.pid || process.name;
        row.appendChild(pidCell);
        
        // Remaining time cell
        const timeCell = document.createElement('div');
        timeCell.className = 'grid-cell';
        timeCell.textContent = process.time || 0;
        row.appendChild(timeCell);
        
        // Status/Transition cell
        const statusCell = document.createElement('div');
        statusCell.className = 'grid-cell';
        statusCell.textContent = process.status || '';
        row.appendChild(statusCell);
        
        gridBody.appendChild(row);
    });
}