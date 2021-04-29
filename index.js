(() => {
  let worker;
  let worker_working = false;

  google.charts.load("current", { packages: ["corechart"] });

  function drawChart(glaph_data) {
    const options = {
      pointSize: 7,
      "hAxis.gridlines.count": 1,
    };
    const data = google.visualization.arrayToDataTable(glaph_data);
    const chart = new google.visualization.LineChart(
      document.querySelector(".output")
    );
    chart.draw(data, options);
  }

  function main() {
    const input_elm = document.querySelector("#input");
    const value = input_elm.value;

    if (worker_working) {
      killWorker();
      workerInit();
    }

    worker_working = true;
    worker.postMessage(value);
  }

  function init() {
    const input_elm = document.querySelector("#input");
    workerInit();
    input_elm.oninput = main
    main();
  }

  function workerInit() {
    worker = new Worker("./worker.js");
    worker.addEventListener(
      "message",
      (e) => {
        const data = e.data;
        worker_working = false;
        google.charts.setOnLoadCallback(drawChart.bind(null, data));
      },
      false
    );
  }

  function killWorker() {
    worker.terminate();
    worker = undefined;
    worker_working = false;
  }

  window.onload = init;
})();
