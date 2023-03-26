const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json"

d3.json(url).then(function (data) {
    console.log(data);
});

// Function that builds the bar chart
function updateBarChart(sample)  {

    // Use D3 to retrieve all of the data
    d3.json(url).then((data) => {
        let samples = data.samples;
        let result = samples.filter(sampleObj => sampleObj.id == sample)[0];

        let otu_ids = result.otu_ids.slice(0, 10).reverse();
        let sample_values = result.sample_values.slice(0, 10).reverse();
        let otu_labels = result.otu_labels.slice(0, 10).reverse();

        let trace = {
            x: sample_values,
            y: otu_ids.map(otu_id => `OTU ${otu_id}`),
            text: otu_labels,
            type: 'bar',
            orientation: 'h'
        };

        var data = [trace];

        let layout = {
            title: 'Top 10 OTUs Found in Individual',
            xaxis: { title: 'Sample Values' },
            yaxis: { title: 'OTU IDs' }
        };

        Plotly.newPlot('bar', data, layout);
    });
}


// Function that builds the bubble chart
function updateBubbleChart(sample) {

    // Use D3 to retrieve all of the data
    d3.json(url).then((data) => {
        let samples = data.samples;
        let result = samples.filter(sampleObj => sampleObj.id == sample)[0];

        let otu_ids = result.otu_ids;
        let sample_values = result.sample_values;
        let otu_labels = result.otu_labels;

        let trace = {
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: 'markers',
            marker: {
                size: sample_values,
                color: otu_ids,
                colorscale: 'Earth'
            }
        };

        var data = [trace];

        let layout = {
            title: 'Bubble Chart for Each Sample',
            xaxis: { title: 'OTU IDs' },
            yaxis: { title: 'Sample Values' },
            showlegend: false
        };

        Plotly.newPlot('bubble', data, layout);
    });
}

// Function that populates metadata info
function updateMetadata(sample) {

    // Use D3 to retrieve all of the data
    d3.json(url).then((data) => {
        let metadata = data.metadata;
        let result = metadata.filter(metaObj => metaObj.id == sample)[0];
        let panel = d3.select("#sample-metadata");

        panel.html("");

        Object.entries(result).forEach(([key, value]) => {
            panel.append("h6").text(`${key}: ${value}`);
        });
    });
}

function optionChanged(sample) {
    updateBarChart(sample);
    updateBubbleChart(sample);
    updateMetadata(sample);
    buildGaugeChart(sample)
}

function init() {
    let dropdown = d3.select("#selDataset");

    d3.json(url).then((data) => {
        let names = data.names;

        names.forEach(name => {
            dropdown.append("option").text(name).property("value", name);
        });

        let initialSample = names[0];
        updateBarChart(initialSample);
        updateBubbleChart(initialSample);
        updateMetadata(initialSample)
        buildGaugeChart(initialsample);
    });
}

init();

