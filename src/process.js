export let listOfProcesses = [];
export let historyProcesses = [];

export const addProcess = ({ pid, time, block }) => {
    // Convert time to integer if it's a string
    try {
        if (typeof time === 'string') {
            time = parseInt(time, 10);
            if (isNaN(time)) {
                console.log("hola")
                window.electronAPI.showErrorDialog('El tiempo de ejecución debe ser un número entero');
                return;
            }
        }
    } catch (error) {
        window.electronAPI.showErrorDialog('Error al procesar el tiempo de ejecución');
        return;
    }

    if( time < 1 ) {
        window.electronAPI.showErrorDialog('El tiempo de ejecución debe ser mayor a 0');
        return;
    }

    if (!pid || time === undefined || block === undefined) {
        window.electronAPI.showErrorDialog('Por favor, llena todos los campos');
        return;
    }

    let pidExists = false;
    listOfProcesses.forEach(process => {
        if(process.pid === pid) {
            window.electronAPI.showErrorDialog('Ya existe un proceso con ese PID');
            pidExists = true;
            return;
        }
    });

    if (pidExists) return;
    
    listOfProcesses.push({ pid, time, block });
}

export const resetHistory = () => {
    historyProcesses = [];
}

export const executeProcess = (process) => {
    // Create a copy of the original process
    const processCopy = { ...process };
    const EXECTIME = 5;

    historyProcesses.push({ ...processCopy, status: 'listo' });
    historyProcesses.push({ ...processCopy, status: 'despacho' });
    historyProcesses.push({ ...processCopy, status: 'ejecución' });
    
    // Modify the copy, not the original
    const updatedProcess = { ...processCopy, time: processCopy.time - EXECTIME };

    if(updatedProcess.time <= 0) {
        updatedProcess.time = 0;
        historyProcesses.push({ ...updatedProcess, status: 'terminado' });
        return;
    }

    if(updatedProcess.block) {
        historyProcesses.push({ ...updatedProcess, status: 'bloqueado' });
        historyProcesses.push({ ...updatedProcess, status: 'bloquear' });
        historyProcesses.push({ ...updatedProcess, status: 'despertar' });
        return executeProcess(updatedProcess);
    }

    historyProcesses.push({ ...updatedProcess, status: 'expiración de tiempo' });
    return executeProcess(updatedProcess);
}
