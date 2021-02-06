function xScale(censusData, xAxisKey, chartWidth) {
  let xLinearScale = d3.scaleLinear()
  .domain([d3.min(censusData, d => d[xAxisKey]) * 0.8, d3.max(censusData, d => d[xAxisKey]) * 1.2])
  .range([0, chartWidth]);

  return xLinearScale;
}

function yScale(censusData, yAxisKey, chartHeight) {
  let yLinearScale = d3.scaleLinear()
  .domain([d3.min(censusData, d => d[yAxisKey]) * 0.8, d3.max(censusData, d => d[yAxisKey]) * 1.2])
  .range([chartHeight, 0]);

  return yLinearScale;
}

function renderXAxis(scale, xAxis) {
  let bottomAxis = d3.axisBottom(scale);
  xAxis.transition().duration(3000).call(bottomAxis);
  return xAxis;
}

function renderYAxis(scale, yAxis) {
  let leftAxis = d3.axisLeft(scale);
  yAxis.transition().duration(3000).call(leftAxis);
  return yAxis;
}

function renderCircles(circlesGroup, newXScale, xAxis, newYScale, yAxis) {
  circlesGroup.transition()
  .duration(3000)
  .attr('cx', data => newXScale(data[xAxis]))
  .attr('cy', data => newYScale(data[yAxis]))

  return circlesGroup;
}

function renderText(textGroup, newXScale, xAxis, newYScale, yAxis) {
  textGroup.transition()
  .duration(3000)
  .attr('x', d => newXScale(d[xAxis]))
  .attr('y', d => newYScale(d[yAxis]));

  return textGroup
}

function updateToolTip(xAxis, yAxis, circlesGroup) {
  let xLabel = '';
  let yLabel = '';

  if (xAxis === 'poverty') {
    xLabel = 'Poverty:';
  } else if (xAxis === 'age') {
    xLabel = 'Age:';
  } else if (xAxis === 'income') {
    xLabel = 'Income:';
  }

  if (yAxis === 'healthcare') {
    yLabel = "Healthcare:"
  } else if (yAxis === 'smokes') {
    yLabel = 'Smokers:';
  } else if (yAxis === 'obesity') {
    yLabel = 'Obesity:';
  }

  const toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
      let tempXAxis = d[xAxis];
      if(xAxis === 'poverty') {
        tempXAxis = tempXAxis + '%';
      }
      return (`${d.state}<br>${xLabel} ${tempXAxis}<br>${yLabel} ${d[yAxis]}%`);
    });

  circlesGroup.call(toolTip);
  circlesGroup.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);

  return circlesGroup;
}

function main() {

  const svgWidth = 1024;
  const svgHeight = 768;

  const margin = {
    top: 10,
    bottom: 0,
    left: 100,
    right: 40
  };

  const chartWidth = svgWidth - margin.right - margin.left;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const scatterChart = d3.select('#scatter').append('div').classed('chart', true);
  const scatterSVG = scatterChart.append('svg').attr("viewBox", `0 0 ${svgHeight} ${svgWidth}`);
  const chartGroup = scatterSVG.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

  let initialXAxisKey = 'poverty';
  let initialYAxisKey = 'healthcare';

  d3.csv('./assets/data/data.csv').then(function(censusData) {
    censusData.forEach(function(data) {
      data.obesity = Number(data.obesity);
      data.income = Number(data.income);
      data.smokes = Number(data.smokes);
      data.age = Number(data.age);
      data.healthcare = Number(data.healthcare);
      data.poverty = Number(data.poverty);
    });

    let xLinearScale = xScale(censusData, initialXAxisKey, chartWidth);
    let yLinearScale = yScale(censusData, initialYAxisKey, chartHeight);

    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append('g').classed('x-axis', true).attr('transform', `translate(0, ${chartHeight})`).call(bottomAxis);
    let yAxis = chartGroup.append('g').classed('y-axis', true).call(leftAxis);

    let circlesGroup = chartGroup.selectAll('circle')
      .data(censusData)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinearScale(d[initialXAxisKey]))
      .attr('cy', d => yLinearScale(d[initialYAxisKey]))
      .attr('r', 14)
      .attr('opacity', 0.5);

    let textGroup = chartGroup.selectAll('.stateText')
      .data(censusData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[initialXAxisKey]))
      .attr('y', d => yLinearScale(d[initialYAxisKey]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d) {
        return d.abbr
      });

    const xLabelsGroup = chartGroup.append('g').attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 10 + margin.top})`);
    const yLabelsGroup = chartGroup.append('g').attr('transform', `translate(${0 - margin.left/4}, ${chartHeight/2})`);

    circlesGroup = updateToolTip(initialXAxisKey, initialYAxisKey, circlesGroup);

    const povertyLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .text('In Poverty %');

    const ageLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .text('Age (Median)');

    const incomeLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

    const healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Lacks Healthcare (%)');

    const smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smokes (%)');

    const obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');

    xLabelsGroup.selectAll('text')
    .on('click', function() {
      const xAxisKey = d3.select(this).attr('value');
      initialXAxisKey = xAxisKey;

      xLinearScale = xScale(censusData, xAxisKey, chartWidth);
      xAxis = renderXAxis(xLinearScale, xAxis);

      textGroup = renderText(textGroup, xLinearScale, xAxisKey, yLinearScale, initialYAxisKey);

      circlesGroup = renderCircles(circlesGroup, xLinearScale, xAxisKey, yLinearScale, initialYAxisKey);
      circlesGroup = updateToolTip(xAxisKey, initialYAxisKey, circlesGroup);

      if (xAxisKey === 'poverty') {
        povertyLabel.classed('active', true).classed('inactive', false);
        ageLabel.classed('active', false).classed('inactive', true);
        incomeLabel.classed('active', false).classed('inactive', true);
      } else if (xAxisKey === 'age') {
        povertyLabel.classed('active', false).classed('inactive', true);
        ageLabel.classed('active', true).classed('inactive', false);
        incomeLabel.classed('active', false).classed('inactive', true);
      } else if (xAxisKey === 'income') {
        povertyLabel.classed('active', false).classed('inactive', true);
        ageLabel.classed('active', false).classed('inactive', true);
        incomeLabel.classed('active', true).classed('inactive', false);
      }
    });

    yLabelsGroup.selectAll('text')
    .on('click', function() {
      const yAxisKey = d3.select(this).attr('value');
      initialYAxisKey = yAxisKey;

      yLinearScale = yScale(censusData, yAxisKey, chartHeight);
      yAxis = renderYAxis(yLinearScale, yAxis);

      textGroup = renderText(textGroup, xLinearScale, initialXAxisKey, yLinearScale, yAxisKey);

      circlesGroup = renderCircles(circlesGroup, xLinearScale, initialXAxisKey, yLinearScale, yAxisKey);
      circlesGroup = updateToolTip(initialXAxisKey, yAxisKey, circlesGroup);

      if (yAxisKey === 'healthcare') {
        healthcareLabel.classed('active', true).classed('inactive', false);
        smokesLabel.classed('active', false).classed('inactive', true);
        obesityLabel.classed('active', false).classed('inactive', true);
      } else if (yAxisKey === 'smokes') {
        healthcareLabel.classed('active', false).classed('inactive', true);
        smokesLabel.classed('active', true).classed('inactive', false);
        obesityLabel.classed('active', false).classed('inactive', true);
      } else if (yAxisKey === 'obesity') {
        healthcareLabel.classed('active', false).classed('inactive', true);
        smokesLabel.classed('active', false).classed('inactive', true);
        obesityLabel.classed('active', true).classed('inactive', false);
      }
    });
    
  });
}

main();