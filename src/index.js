import { $, $$, generateTableProcess, generateTableExecProcess } from "./utils.js"
import { listOfProcesses, addProcess, historyProcesses, resetHistory, resetListProcess, popProcess } from "./process.js"

$("#user-manual").addEventListener("click", () => {
    window.electronAPI.userManual()
})

$("#closeApp").addEventListener("click", async () => {
    if (await window.electronAPI.showConfirmDialog("¿Estás seguro que deseas cerrar la aplicación?")) {
        window.electronAPI.closeApp()
    }
})

$("#add-process").addEventListener("click", () => {
    const pid = $("#pid").value
    const time = $("#time").value
    const priority = $("#priority").value
    const changePriority = $("#change-priority").value
    const block = $("#blocked").value
    const suspend = $("#suspend").value
    const reanudar = $("#reanudar").value
    const destruir = $("#destruir").value

    const isSuccess = addProcess({ pid, time, block, priority, changePriority, suspend, reanudar, destruir })
    generateTableProcess(listOfProcesses)

    console.log(listOfProcesses)

    if (isSuccess) {
        $('#pid').value = ""
        $("#time").value = ""
        $("#priority").value = ""
        $("#change-priority").value = ""
    }
})
$("#execute-process").addEventListener("click", () => {
    
    if(listOfProcesses.length === 0) {
        window.electronAPI.showErrorDialog("No hay procesos registrados para ejecutar la simulación.")
        return;
    }
    
    resetHistory()
    
    listOfProcesses.forEach(process => {
        historyProcesses.push({
            ...process,
            status: 'inicializado'
        });
    })

    // Sort processes by priority (1 is highest priority)
    listOfProcesses.sort((a, b) => parseInt(a.priority) - parseInt(b.priority));
    
    // Group processes by priority
    const processesByPriority = {};
    listOfProcesses.forEach(process => {
        const priority = process.priority;
        if (!processesByPriority[priority]) {
            processesByPriority[priority] = [];
        }
        processesByPriority[priority].push({...process});
    });
    
    // Clear original list since we have copies
    resetListProcess();
    
    const EXECTIME = 5;
    let priorities = Object.keys(processesByPriority).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Continue processing until all priorities are empty
    while (priorities.length > 0) {
        // Get the current lowest priority
        const priority = priorities[0];
        let processes = processesByPriority[priority];
        
        if (processes.length === 0) {
            // Remove this priority if empty
            priorities.shift();
            continue;
        }
        
        // Process the next item in the current priority
        const process = processes.shift();
        
        // Store complete process information in history
        historyProcesses.push({
            ...process,
            status: 'listo'
        });
        
        historyProcesses.push({
            ...process,
            status: 'despacho'
        });
        
        historyProcesses.push({
            ...process,
            status: 'ejecución'
        });
        
        // Modify the copy, not the original
        const updatedProcess = {...process, time: parseInt(process.time) - EXECTIME};
        
        // Check if process is to be destroyed
        if(updatedProcess.destruir === 'yes') {
            if(updatedProcess.time <= 0) updatedProcess.time = 0;
            historyProcesses.push({
                ...updatedProcess,
                status: 'destruido'
            });
            continue;
        }

        // Check if process is finished
        if(updatedProcess.time <= 0) {
            updatedProcess.time = 0;
            historyProcesses.push({
                ...updatedProcess,
                status: 'terminado'
            });
            continue;
        }

        let currentProcess = {...updatedProcess};
        
        if(currentProcess.changePriority && updatedProcess.priority !== currentProcess.changePriority) {
            const newPriority = currentProcess.changePriority;
            historyProcesses.push({
                ...currentProcess,
                priority: newPriority,
                status: 'cambio de prioridad'
            });
            
            // Add to new priority queue
            if (!processesByPriority[newPriority]) {
                processesByPriority[newPriority] = [];
                // Update the priorities array
                priorities = [...priorities, newPriority];
                priorities.sort((a, b) => parseInt(a) - parseInt(b));
            }
            
            // Update current process with new priority and add to appropriate queue
            currentProcess = {
                ...currentProcess,
                priority: newPriority
            };
            
            processesByPriority[newPriority].push(currentProcess);
            // continue;
        }
        
        // Check if process is suspended
        if(currentProcess.suspend === 'yes') {
            historyProcesses.push({
                ...currentProcess,
                status: 'suspendido'
            });
            
            // If also marked to resume
            if(currentProcess.reanudar === 'yes') {
                historyProcesses.push({
                    ...currentProcess,
                    status: 'reanudado'
                });
                processesByPriority[currentProcess.priority].push({...currentProcess, suspend: 'no'});
            } else {
                processesByPriority[currentProcess.priority].push({...currentProcess});
            }
            
            continue;
        }
        
        if(currentProcess.block === 'yes') {
            historyProcesses.push({
                ...currentProcess,
                status: 'bloquear'
            });
            
            historyProcesses.push({
                ...currentProcess,
                status: 'despertar'
            });

            processesByPriority[currentProcess.priority].push({...currentProcess});
            continue;
        }
        
        historyProcesses.push({
            ...currentProcess,
            status: 'tiempo de expiración'
        });
        processesByPriority[currentProcess.priority].push(currentProcess);
    }

    console.log(historyProcesses);
    
    // Update the UI
    $$(".filter-process").forEach(f => f.classList.remove("active"));
    $("#all").classList.add("active");

    generateTableExecProcess(historyProcesses);
    generateTableProcess(listOfProcesses);
})

$("#search-process").addEventListener("click", () => {
    const pid = $("#search-pid").value
    let historyProcess = []
    const process = historyProcesses.forEach(process => {
        if (process.pid === pid) {
            historyProcess.push(process)
        }
    })

    if (historyProcess.length === 0) {
        window.electronAPI.showErrorDialog(`Proceso ${pid} no encontrado`)
        return  
    }

    generateTableExecProcess(historyProcess)
})

$$(".filter-process").forEach(filter => {
    filter.addEventListener("click", () => {
        // Remove 'active' class from all filters
        $$(".filter-process").forEach(f => f.classList.remove("active"));
        // Add 'active' class to the clicked filter
        filter.classList.add("active");
        const filterValue = filter.id;
        let historyProcessFilter = [];
        switch (filterValue) {
            case "all":
                historyProcessFilter = [...historyProcesses];
                generateTableExecProcess(historyProcessFilter);
                break;
                case "ready":
                    historyProcessFilter = historyProcesses.filter(process => process.status === 'listo');
                    generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar', 'destruir']);
                break;
            case "init":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'inicializado');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar', 'destruir']);
                break;
            case "despacho":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'despacho');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar', 'destruir']);
                break;    
            case "running":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'ejecución');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar', 'destruir']);
                break;
            case "time-exp":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'tiempo de expiración');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar', 'destruir']);
                break;
            case "blocked":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'bloquear');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'suspend', 'reanudar', 'destruir']);
                break;
            case "despertar":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'despertar');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar', 'destruir']);
                break;
            case "suspendido":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'suspendido');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'reanudar', 'destruir']);
                break;
            case "destruidos":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'destruido');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'reanudar']);
                break;
            case "finished":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'terminado');
                generateTableExecProcess(historyProcessFilter, ['pid', 'priority', 'block', 'suspend', 'reanudar', 'destruir']);
                break;
            case "reanudado":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'reanudado');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'destruir']);
                break;
            case "cambio-prioridad":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'cambio de prioridad');
                generateTableExecProcess(historyProcessFilter, ['pid', 'time', 'priority', 'block', 'suspend', 'destruir']);
                break;
            default:
                console.log("ID no reconocido");
                historyProcessFilter = [...historyProcesses];
        }
    })
})