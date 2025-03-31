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
    const block = $("#blocked").value
    const readySuspend = $("#ready-suspend").value
    const blockSuspend = $("#block-suspend").value
    const reanudar = $("#reanudar").value

    const isSuccess = addProcess({ pid, time, block, readySuspend, blockSuspend, reanudar })
    generateTableProcess(listOfProcesses)

    console.log(listOfProcesses)

    if (isSuccess) {
        $('#pid').value = ""
        $("#time").value = ""
        $("#blocked").value = "no"
        $("#ready-suspend").value = "no"
        $("#block-suspend").value = "no"
        $("#reanudar").value = "no"
    }
})
$("#execute-process").addEventListener("click", () => {

    if (listOfProcesses.length === 0) {
        window.electronAPI.showErrorDialog("No hay procesos registrados para ejecutar la simulación.")
        return;
    }

    resetHistory()

    listOfProcesses.forEach(process => {
        historyProcesses.push({
            ...process,
            status: 'nuevo'
        });
    })

    // Create a queue with copies of all processes
    const processQueue = listOfProcesses.map(process => ({ ...process }));

    // Clear original list since we have copies
    resetListProcess();

    const EXECTIME = 5;

    // Continue processing until all processes are done
    while (processQueue.length > 0) {
        // Get the next process from the queue
        const process = processQueue.shift();

        // Store process states in history
        historyProcesses.push({
            ...process,
            status: 'listo'
        });

        if (process.readySuspend === 'yes') {
            historyProcesses.push({
                ...process,
                status: 'suspendido'
            });

            historyProcesses.push({
                ...process,
                status: 'suspendido listo'
            });

            // If marked to resume
            if (process.reanudar === 'yes') {
                historyProcesses.push({
                    ...process,
                    status: 'reanudado'
                });
            }

            historyProcesses.push({
                ...process,
                status: "listo"
            })
        }

        historyProcesses.push({
            ...process,
            status: 'despacho'
        });

        historyProcesses.push({
            ...process,
            status: 'ejecución'
        });

        // Process execution - reduce time
        const updatedProcess = { ...process, time: parseInt(process.time) - EXECTIME };

        // Check if process is finished
        if (updatedProcess.time <= 0) {

            // If process is marked to block
            if (updatedProcess.block === 'yes') {

                historyProcesses.push({
                    ...updatedProcess,
                    status: "espera de evento",
                })

                historyProcesses.push({
                    ...updatedProcess,
                    status: 'bloquear'
                });
            }

            updatedProcess.time = 0;
            historyProcesses.push({
                ...updatedProcess,
                status: 'terminado'
            });
            continue;
        }

        let currentProcess = { ...updatedProcess };

        // Check if process is marked to block
        if (currentProcess.block === 'yes') {

            historyProcesses.push({
                ...currentProcess,
                status: "espera de evento",
            })

            historyProcesses.push({
                ...currentProcess,
                status: 'bloquear'
            });

            // Handle block suspend
            if (currentProcess.blockSuspend === 'yes') {

                historyProcesses.push({
                    ...currentProcess,
                    status: 'suspendido'
                });

                historyProcesses.push({
                    ...currentProcess,
                    status: 'suspendido bloqueado'
                });

                if (currentProcess.readySuspend === 'yes') {
                    historyProcesses.push({
                        ...currentProcess,
                        status: "suspendido listo",
                    })
                } else {
                    historyProcesses.push({
                        ...currentProcess,
                        status: "bloquear",
                    })
                }

                // If marked to resume
                if (currentProcess.reanudar === 'yes') {
                    historyProcesses.push({
                        ...currentProcess,
                        status: 'reanudado'
                    });
                }

            }

            historyProcesses.push({
                ...currentProcess,
                status: 'terminacion operacion'
            });

            processQueue.push(currentProcess);
            continue;
        } else if (currentProcess.readySuspend === "yes") {
            historyProcesses.push({
                ...currentProcess,
                status: "suspendido"
            })

            historyProcesses.push({
                ...currentProcess,
                status: "suspendido listo"
            })

            if (currentProcess.reanudar === "yes") {
                historyProcesses.push({
                    ...currentProcess,
                    status: 'reanudado'
                });
            }

            processQueue.push(currentProcess);
            continue;
        }

        historyProcesses.push({
            ...currentProcess,
            status: 'tiempo de expiración'
        });

        // Add the unfinished process to the end of the queue
        processQueue.push(currentProcess);
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
            case "init":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'nuevo');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "ready":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'listo');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "despacho":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'despacho');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "running":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'ejecución');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "time-exp":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'tiempo de expiración');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "blocked":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'bloquear');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "terminacion operacion":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'terminacion operacion');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "wait-event":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'espera de evento')
                generateTableExecProcess(historyProcessFilter);
                break;
            case "suspendidos":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'suspendido');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "suspendido-listo":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'suspendido listo');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "suspendido-bloqueado":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'suspendido bloqueado');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "finished":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'terminado');
                generateTableExecProcess(historyProcessFilter);
                break;
            case "reanudado":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'reanudado');
                generateTableExecProcess(historyProcessFilter);
                break;
            default:
                console.log("ID no reconocido");
                historyProcessFilter = [...historyProcesses];
                generateTableExecProcess(historyProcessFilter);
        }
    });
});
