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
        
        // Priority cell
        const priorityCell = document.createElement('div');
        priorityCell.className = 'grid-cell';
        const priorityInput = document.createElement('input');
        priorityInput.className = 'input-table';
        priorityInput.type = 'number';
        priorityInput.value = process.priority || 0;
        priorityInput.min = 0;
        priorityCell.appendChild(priorityInput);
        row.appendChild(priorityCell);
        
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
        
        // Suspended status cell
        const suspendedCell = document.createElement('div');
        suspendedCell.className = 'grid-cell';
        const suspendSelect = document.createElement('select');
        suspendSelect.className = 'input-table';
        
        const yesSuspendOption = document.createElement('option');
        yesSuspendOption.value = 'yes';
        yesSuspendOption.textContent = 'Sí';
        
        const noSuspendOption = document.createElement('option');
        noSuspendOption.value = 'no';
        noSuspendOption.textContent = 'No';
        
        suspendSelect.appendChild(yesSuspendOption);
        suspendSelect.appendChild(noSuspendOption);
        suspendSelect.value = process.suspend === 'yes' || process.suspend === true ? 'yes' : 'no';
        
        suspendedCell.appendChild(suspendSelect);
        row.appendChild(suspendedCell);
        
        // Resume status cell (New)
        const resumeCell = document.createElement('div');
        resumeCell.className = 'grid-cell';
        const resumeSelect = document.createElement('select');
        resumeSelect.className = 'input-table';
        
        const yesResumeOption = document.createElement('option');
        yesResumeOption.value = 'yes';
        yesResumeOption.textContent = 'Sí';
        
        const noResumeOption = document.createElement('option');
        noResumeOption.value = 'no';
        noResumeOption.textContent = 'No';
        
        resumeSelect.appendChild(yesResumeOption);
        resumeSelect.appendChild(noResumeOption);
        resumeSelect.value = process.reanudar === 'yes' || process.reanudar === true ? 'yes' : 'no';
        
        resumeCell.appendChild(resumeSelect);
        row.appendChild(resumeCell);
        
        // Destroy status cell (New)
        const destroyCell = document.createElement('div');
        destroyCell.className = 'grid-cell';
        const destroySelect = document.createElement('select');
        destroySelect.className = 'input-table';
        
        const yesDestroyOption = document.createElement('option');
        yesDestroyOption.value = 'yes';
        yesDestroyOption.textContent = 'Sí';
        
        const noDestroyOption = document.createElement('option');
        noDestroyOption.value = 'no';
        noDestroyOption.textContent = 'No';
        
        destroySelect.appendChild(yesDestroyOption);
        destroySelect.appendChild(noDestroyOption);
        destroySelect.value = process.destruir === 'yes' || process.destruir === true ? 'yes' : 'no';
        
        destroyCell.appendChild(destroySelect);
        row.appendChild(destroyCell);
        
        // Actions cell
        const actionsCell = document.createElement('div');
        actionsCell.className = 'grid-cell actions-cell';
        
        const actionsList = document.createElement('ul');
        actionsList.className = 'dropdown-content';
        
        const updateAction = document.createElement('li');
        updateAction.className = 'action update-process';
        updateAction.textContent = 'Actualizar';
        updateAction.classList.add("small-font")
        updateAction.dataset.pid = process.pid || process.name;

        updateAction.addEventListener('click', () => {
            // Get values from inputs
            const time = parseInt(timeInput.value) || process.time;
            const priority = parseInt(priorityInput.value) || process.priority;
            const block = blockSelect.value;
            const suspend = suspendSelect.value;
            const reanudar = resumeSelect.value;
            const destruir = destroySelect.value;
            
            // Update the process in listOfProcesses
            listOfProcesses[index].time = time;
            listOfProcesses[index].priority = priority;
            listOfProcesses[index].block = block;
            listOfProcesses[index].suspend = suspend;
            listOfProcesses[index].reanudar = reanudar;
            listOfProcesses[index].destruir = destruir;
            
            window.electronAPI.showInfoDialog(`Proceso ${process.pid || process.name} actualizado correctamente.`);
        });
        
        const deleteAction = document.createElement('li');
        deleteAction.className = 'action delete-process';
        deleteAction.textContent = 'Borrar';
        deleteAction.classList.add("small-font")
        deleteAction.dataset.pid = process.pid || process.name;
        deleteAction.addEventListener('click', async () => {
            
            const deleteProcess = await window.electronAPI.showConfirmDialog("Estas seguro que deseas eleminar el proceso: " +  process.pid || process.name)
            if (deleteProcess) {
                // Remove the process from listOfProcesses
                listOfProcesses.splice(index, 1);
            
                // Regenerate the table
                generateTableProcess(listOfProcesses);
                window.electronAPI.showInfoDialog(`Proceso ${process.pid || process.name} eliminado`);
            }

        });
        
        actionsList.appendChild(updateAction);
        actionsList.appendChild(deleteAction);
        actionsCell.appendChild(actionsList);
        row.appendChild(actionsCell);
        
        gridBody.appendChild(row);
    });
}
export const generateTableExecProcess = (historyProcesses, columns = null) => {
    const gridBody = $('#process-grid-body');
    
    // Define default columns if none provided
    const defaultColumns = ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar', 'destruir', 'status'];
    
    // Use provided columns or default to all columns
    const columnsToShow = columns || defaultColumns;
    
    // Define column rendering functions
    const columnRenderers = {
        pid: (process) => process.pid || '',
        time: (process) => process.time || 0,
        priority: (process) => process.priority || 0,
        block: (process) => process.block === 'yes' ? 'Sí' : 'No',
        suspend: (process) => process.suspend === 'yes' ? 'Sí' : 'No',
        reanudar: (process) => process.reanudar === 'yes' ? 'Sí' : 'No',
        destruir: (process) => process.destruir === 'yes' ? 'Sí' : 'No',
        status: (process) => process.status || ''
    };
    
    // Clear existing rows
    gridBody.innerHTML = '';
    
    // Update header row if it exists
    const gridHeader = $('#process-grid-header');
    if (gridHeader) {
        gridHeader.innerHTML = '';
        
        // Define column labels
        const columnLabels = {
            pid: 'Nombre del proceso',
            time: 'Tiempo restante',
            priority: 'Prioridad',
            block: 'Bloqueado',
            suspend: 'Suspendido',
            reanudar: 'Reanudado',
            destruir: 'Destruido',
            status: 'Estado'
        };
        
        columnsToShow.forEach(columnId => {
            const headerCell = document.createElement('div');
            headerCell.className = 'grid-cell header-cell';
            headerCell.textContent = columnLabels[columnId] || columnId;
            gridHeader.appendChild(headerCell);
        });
    }
    
    // Generate new rows
    historyProcesses.forEach((process) => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        
        // Add cells for each requested column
        columnsToShow.forEach(columnId => {
            if (columnRenderers[columnId]) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = columnRenderers[columnId](process);
                row.appendChild(cell);
            }
        });
        
        gridBody.appendChild(row);
    });
}