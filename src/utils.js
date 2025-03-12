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
        pidInput.value = process.pid || '';
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
        
        const noOption = document.createElement('option');
        noOption.value = 'no';
        noOption.textContent = 'No';
        
        const yesOption = document.createElement('option');
        yesOption.value = 'yes';
        yesOption.textContent = 'Sí';
        
        blockSelect.appendChild(noOption);
        blockSelect.appendChild(yesOption);
        blockSelect.value = process.block || 'no';
        
        blockedCell.appendChild(blockSelect);
        row.appendChild(blockedCell);
        
        // Ready Suspended status cell
        const readySuspendedCell = document.createElement('div');
        readySuspendedCell.className = 'grid-cell';
        const readySuspendSelect = document.createElement('select');
        readySuspendSelect.className = 'input-table';
        
        const noReadySuspendOption = document.createElement('option');
        noReadySuspendOption.value = 'no';
        noReadySuspendOption.textContent = 'No';
        
        const yesReadySuspendOption = document.createElement('option');
        yesReadySuspendOption.value = 'yes';
        yesReadySuspendOption.textContent = 'Sí';
        
        readySuspendSelect.appendChild(noReadySuspendOption);
        readySuspendSelect.appendChild(yesReadySuspendOption);
        readySuspendSelect.value = process.readySuspend || 'no';
        
        readySuspendedCell.appendChild(readySuspendSelect);
        row.appendChild(readySuspendedCell);
        
        // Block Suspended status cell
        const blockSuspendedCell = document.createElement('div');
        blockSuspendedCell.className = 'grid-cell';
        const blockSuspendSelect = document.createElement('select');
        blockSuspendSelect.className = 'input-table';
        
        const noBlockSuspendOption = document.createElement('option');
        noBlockSuspendOption.value = 'no';
        noBlockSuspendOption.textContent = 'No';
        
        const yesBlockSuspendOption = document.createElement('option');
        yesBlockSuspendOption.value = 'yes';
        yesBlockSuspendOption.textContent = 'Sí';
        
        blockSuspendSelect.appendChild(noBlockSuspendOption);
        blockSuspendSelect.appendChild(yesBlockSuspendOption);
        blockSuspendSelect.value = process.blockSuspend || 'no';
        
        blockSuspendedCell.appendChild(blockSuspendSelect);
        row.appendChild(blockSuspendedCell);
        
        // Resume status cell
        const resumeCell = document.createElement('div');
        resumeCell.className = 'grid-cell';
        const resumeSelect = document.createElement('select');
        resumeSelect.className = 'input-table';
        
        const noResumeOption = document.createElement('option');
        noResumeOption.value = 'no';
        noResumeOption.textContent = 'No';
        
        const yesResumeOption = document.createElement('option');
        yesResumeOption.value = 'yes';
        yesResumeOption.textContent = 'Sí';
        
        resumeSelect.appendChild(noResumeOption);
        resumeSelect.appendChild(yesResumeOption);
        resumeSelect.value = process.reanudar || 'no';
        
        resumeCell.appendChild(resumeSelect);
        row.appendChild(resumeCell);
        
        // Actions cell
        const actionsCell = document.createElement('div');
        actionsCell.className = 'grid-cell actions-cell';
        
        const actionsList = document.createElement('ul');
        actionsList.className = 'dropdown-content';
        
        const updateAction = document.createElement('li');
        updateAction.className = 'action update-process';
        updateAction.textContent = 'Actualizar';
        updateAction.classList.add("small-font");
        updateAction.dataset.pid = process.pid;

        updateAction.addEventListener('click', () => {
            // Get values from inputs
            const time = parseInt(timeInput.value) || process.time;
            const block = blockSelect.value;
            const readySuspend = readySuspendSelect.value;
            const blockSuspend = blockSuspendSelect.value;
            const reanudar = resumeSelect.value;
            
            // Update the process in listOfProcesses
            listOfProcesses[index].time = time;
            listOfProcesses[index].block = block;
            listOfProcesses[index].readySuspend = readySuspend;
            listOfProcesses[index].blockSuspend = blockSuspend;
            listOfProcesses[index].reanudar = reanudar;
            
            window.electronAPI.showInfoDialog(`Proceso ${process.pid} actualizado correctamente.`);
        });
        
        const deleteAction = document.createElement('li');
        deleteAction.className = 'action delete-process';
        deleteAction.textContent = 'Borrar';
        deleteAction.classList.add("small-font");
        deleteAction.dataset.pid = process.pid;
        deleteAction.addEventListener('click', async () => {
            const deleteProcess = await window.electronAPI.showConfirmDialog("¿Estás seguro que deseas eliminar el proceso: " + process.pid);
            if (deleteProcess) {
                // Remove the process from listOfProcesses
                listOfProcesses.splice(index, 1);
            
                // Regenerate the table
                generateTableProcess(listOfProcesses);
                window.electronAPI.showInfoDialog(`Proceso ${process.pid} eliminado`);
            }
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
        
        // Nombre del proceso cell
        const pidCell = document.createElement('div');
        pidCell.className = 'grid-cell';
        pidCell.textContent = process.pid || '';
        row.appendChild(pidCell);
        
        // Tiempo restante cell
        const timeCell = document.createElement('div');
        timeCell.className = 'grid-cell';
        timeCell.textContent = process.time || 0;
        row.appendChild(timeCell);
        
        // Bloqueado cell
        const blockedCell = document.createElement('div');
        blockedCell.className = 'grid-cell';
        blockedCell.textContent = process.block === 'yes' ? 'Sí' : 'No';
        row.appendChild(blockedCell);
        
        // Suspendido Listo cell
        const readySuspendedCell = document.createElement('div');
        readySuspendedCell.className = 'grid-cell';
        readySuspendedCell.textContent = process.readySuspend === 'yes' ? 'Sí' : 'No';
        row.appendChild(readySuspendedCell);
        
        // Suspendido Bloqueado cell
        const blockSuspendedCell = document.createElement('div');
        blockSuspendedCell.className = 'grid-cell';
        blockSuspendedCell.textContent = process.blockSuspend === 'yes' ? 'Sí' : 'No';
        row.appendChild(blockSuspendedCell);
        
        // Reanudado cell
        const reanudarCell = document.createElement('div');
        reanudarCell.className = 'grid-cell';
        reanudarCell.textContent = process.reanudar === 'yes' ? 'Sí' : 'No';
        row.appendChild(reanudarCell);
        
        // Estado cell
        const statusCell = document.createElement('div');
        statusCell.className = 'grid-cell';
        statusCell.textContent = process.status || '';
        row.appendChild(statusCell);
        
        gridBody.appendChild(row);
    });
}
