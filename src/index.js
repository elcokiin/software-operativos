import { $, $$, generateTableProcess, generateTableExecProcess } from "./utils.js"
import { listOfProcesses, addProcess, historyProcesses, executeProcess } from "./process.js"

$("#closeApp").addEventListener("click", async () => {
    if (await window.electronAPI.showConfirmDialog("¿Estás seguro que deseas cerrar la aplicación?")) {
        window.electronAPI.closeApp()
    }
})

$("#add-process").addEventListener("click", () => {
    const pid = $("#pid").value
    const time = $("#time").value
    const block = $("#blocked").value === 'yes' ? true : false

    addProcess({ pid, time, block })
    generateTableProcess(listOfProcesses)
})

$("#execute-process").addEventListener("click", () => {
    listOfProcesses.forEach(process => {
        executeProcess(process);
    })

    generateTableExecProcess(historyProcesses)
})

$("#search-process").addEventListener("click", () => {
    console.log("hola")
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
                break;
            case "ready":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'listo');
                break;
            case "running":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'ejecución');
                break;
            case "blocked":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'bloquear');
                break;
            case "finished":
                historyProcessFilter = historyProcesses.filter(process => process.status === 'terminado');
                break;
            default:
                console.log("ID no reconocido");
                historyProcessFilter = [...historyProcesses];
        }
        generateTableExecProcess(historyProcessFilter);
    })
})