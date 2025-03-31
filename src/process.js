export let listOfProcesses = [];
export let historyProcesses = [];
export let updatedFills = [];

export const resetListProcess = () => {
    listOfProcesses = []
}

export const popProcess = () => {
    listOfProcesses[0] = undefined;
    listOfProcesses = listOfProcesses.filter(process => process !== undefined);
}

export const addProcess = ({ pid, time, block, readySuspend, blockSuspend, reanudar }) => {
    // Convert time to integer if it's a string
    try {
        if (typeof time === 'string') {
            time = parseInt(time, 10);
            if (isNaN(time)) {
                window.electronAPI.showErrorDialog('El tiempo de ejecución debe ser un número entero');
                return 0;
            }
        }
    } catch (error) {
        window.electronAPI.showErrorDialog('Error al procesar el tiempo de ejecución');
        return 0;
    }

    if (block === "no" && blockSuspend === "yes") {
        window.electronAPI.showErrorDialog("Error el proceso debe estar bloqueado para poder ser suspendido bloqueado.")
        return 0;
    }

    // if (block === "yes" && readySuspend === "yes") {
    //     window.electronAPI.showErrorDialog("Error el proceso no puede estar bloqueado y suspendido listo.")
    //     return 0;
    // }

    if (reanudar === "yes" && (readySuspend === "no" && blockSuspend === "no")) {
        window.electronAPI.showErrorDialog("Error el proceso no puede reanudarse si no esta suspendido.")
        return 0;
    }

    if( time < 1 ) {
        window.electronAPI.showErrorDialog('El tiempo de ejecución debe ser mayor a 0');
        return 0;
    }

    if (!pid || time === undefined || block === undefined || blockSuspend === undefined || reanudar === undefined || readySuspend === undefined) {
        window.electronAPI.showErrorDialog('Por favor, llena todos los campos');
        return 0;
    }

    let pidExists = false;
    listOfProcesses.forEach(process => {
        if(process.pid === pid) {
            window.electronAPI.showErrorDialog('Ya existe un proceso con el mismo nombre.');
            pidExists = true;
            return 0;
        }
    });

    if (pidExists) return 0;
    
    listOfProcesses.push({ pid, time, block, blockSuspend, readySuspend, reanudar,  });
    return 1;
}

export const resetHistory = () => {
    historyProcesses = [];
}


// export const executeProcess = (process) => {
//     // Create a copy of the original process
//     const processCopy = { ...process };
//     const EXECTIME = 5;

//     historyProcesses.push({ ...processCopy, status: 'listo' });
//     historyProcesses.push({ ...processCopy, status: 'despacho' });
//     historyProcesses.push({ ...processCopy, status: 'ejecución' });
    
//     // Check if process is to be destroyed
//     if(processCopy.destruir === 'yes') {
//         historyProcesses.push({ ...processCopy, status: 'destruido' });
//         return;
//     }
    
//     // Check if process is suspended
//     if(processCopy.suspend === 'yes') {
//         historyProcesses.push({ ...processCopy, status: 'suspendido' });
        
//         // If also marked to resume
//         if(processCopy.reanudar === 'yes') {
//             historyProcesses.push({ ...processCopy, status: 'reanudado' });
//             // Continue execution with suspension removed
//             return executeProcess({...processCopy, suspend: 'no'});
//         }
//         return;
//     }
    
//     // Modify the copy, not the original
//     const updatedProcess = { ...processCopy, time: processCopy.time - EXECTIME };

//     if(updatedProcess.time <= 0) {
//         updatedProcess.time = 0;
//         historyProcesses.push({ ...updatedProcess, status: 'terminado' });
//         return;
//     }

//     if(updatedProcess.block === 'yes') {
//         historyProcesses.push({ ...updatedProcess, status: 'bloqueado' });
//         historyProcesses.push({ ...updatedProcess, status: 'bloquear' });
        
//         // If also marked to resume
//         if(updatedProcess.reanudar === 'yes') {
//             historyProcesses.push({ ...updatedProcess, status: 'despertar' });
//             // Continue execution with block removed
//             return executeProcess({...updatedProcess, block: 'no'});
//         }
//         return;
//     }

//     historyProcesses.push({ ...updatedProcess, status: 'tiempo de expiración' });
//     return executeProcess(updatedProcess);
// }