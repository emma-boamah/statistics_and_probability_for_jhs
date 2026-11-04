const $ = (selector) => document.querySelector(selector);

function parseData() {
  const raw = $('#data-input').value.trim();
  const error = $('#data-error');
  if (!raw) { error.textContent = 'Enter at least one whole number, separated by commas.'; return null; }
  const parts = raw.split(',').map((part) => part.trim());
  if (parts.length > 20) { error.textContent = 'Please use 20 numbers or fewer so the chart stays easy to read.'; return null; }
  if (parts.some((part) => part === '' || !/^-?\d+$/.test(part))) { error.textContent = 'Use whole numbers separated by commas, for example: 2, 4, 4, 7.'; return null; }
  const values = parts.map(Number);
  if (values.some((value) => !Number.isSafeInteger(value) || Math.abs(value) > 10000)) { error.textContent = 'Use whole numbers from −10,000 to 10,000.'; return null; }
  error.textContent = '';
  return values;
}
function analyseData() {
  const values = parseData();
  if (!values) return;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  const frequency = new Map();
  values.forEach((value) => frequency.set(value, (frequency.get(value) || 0) + 1));
  const largestFrequency = Math.max(...frequency.values());
  const modes = largestFrequency === 1 ? [] : [...frequency.entries()].filter(([, count]) => count === largestFrequency).map(([value]) => value).sort((a, b) => a - b);
  $('#mean').textContent = Number(mean.toFixed(2));
  $('#median').textContent = median;
  $('#mode').textContent = modes.length ? modes.join(', ') : 'None';
  $('#range').textContent = sorted[sorted.length - 1] - sorted[0];
  $('#data-count').textContent = `${values.length} ${values.length === 1 ? 'value' : 'values'}`;
  const chart = $('#bar-chart');
  chart.replaceChildren();
  const entries = [...frequency.entries()].sort(([a], [b]) => a - b);
  const maxFrequency = Math.max(...entries.map(([, count]) => count));
  entries.forEach(([value, count]) => {
    const column = document.createElement('div'); column.className = 'bar-column';
    const valueLabel = document.createElement('span'); valueLabel.className = 'bar-value'; valueLabel.textContent = count;
    const bar = document.createElement('div'); bar.className = 'bar'; bar.style.height = `${Math.max(4, count / maxFrequency * 82)}%`;
    const category = document.createElement('span'); category.className = 'bar-label'; category.textContent = value;
    column.append(valueLabel, bar, category); chart.append(column);
  });
  chart.setAttribute('aria-label', entries.map(([value, count]) => `${value}: ${count}`).join('; '));
}
$('#analyse-data').addEventListener('click', analyseData);
$('#sample-data').addEventListener('click', () => { $('#data-input').value = '4, 6, 6, 8, 11, 13'; analyseData(); });
$('#data-input').addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') analyseData(); });
analyseData();

const experiments = {
  coin: { title: 'Coin flips', theory: '1 in 2', percent: 50, detail: 'A fair coin has 2 equally likely sides.', outcomes: ['Heads', 'Tails'], target: 'Heads', symbol: { Heads: 'H', Tails: 'T' } },
  die: { title: 'Die rolls', theory: '1 in 6', percent: 100 / 6, detail: 'A fair six-sided die has 6 equally likely outcomes.', outcomes: ['1', '2', '3', '4', '5', '6'], target: '6', symbol: { '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6' } },
  spinner: { title: 'Spinner spins', theory: '1 in 4', percent: 25, detail: 'This spinner has 4 equal sections: 1 blue and 3 other colours.', outcomes: ['Blue', 'Red', 'Yellow', 'Green'], target: 'Blue', symbol: { Blue: 'B', Red: 'R', Yellow: 'Y', Green: 'G' } }
};
let trialCount = 0;
let targetCount = 0;
let recentOutcomes = [];
function updateExperimentInfo() {
  const item = experiments[$('#experiment').value];
  $('#experiment-title').textContent = item.title;
  $('#theory').innerHTML = `${item.theory} <small>(${Number(item.percent.toFixed(1))}%)</small>`;
  $('#theory-detail').textContent = item.detail;
  $('#theory-marker').style.left = `${item.percent}%`;
  $('#theory-marker').title = `Theoretical probability: ${Number(item.percent.toFixed(1))}%`;
  $('#trial-count').textContent = trialCount;
  $('#experimental-probability').textContent = trialCount ? `${Number((targetCount / trialCount * 100).toFixed(1))}%` : '—';
  $('#meter-fill').style.width = trialCount ? `${targetCount / trialCount * 100}%` : '0%';
  const outcomes = $('#outcomes'); outcomes.replaceChildren();
  if (!recentOutcomes.length) {
    const empty = document.createElement('span'); empty.className = 'empty-outcomes'; empty.textContent = 'Run an experiment to see outcomes.'; outcomes.append(empty);
  } else {
    recentOutcomes.forEach((outcome) => {
      const token = document.createElement('span'); token.className = `outcome-token${outcome === item.target ? ' target' : ''}`; token.textContent = item.symbol[outcome];
      token.title = outcome; outcomes.append(token);
    });
  }
  if (trialCount) $('#experiment-message').textContent = `Target outcome: ${targetCount} out of ${trialCount} trials (${Number((targetCount / trialCount * 100).toFixed(1))}%). Random results vary; try more trials and compare with ${Number(item.percent.toFixed(1))}% theoretical probability.`;
  else $('#experiment-message').textContent = 'As you run more trials, the experimental probability often gets closer to the theoretical probability—but random results can vary.';
}
function runTrials() {
  const item = experiments[$('#experiment').value];
  for (let i = 0; i < 10; i++) {
    const outcome = item.outcomes[Math.floor(Math.random() * item.outcomes.length)];
    trialCount++; if (outcome === item.target) targetCount++;
    recentOutcomes.push(outcome);
  }
  recentOutcomes = recentOutcomes.slice(-30);
  updateExperimentInfo();
}
$('#experiment').addEventListener('change', () => { trialCount = 0; targetCount = 0; recentOutcomes = []; updateExperimentInfo(); });
$('#run-experiment').addEventListener('click', runTrials);
$('#reset-experiment').addEventListener('click', () => { trialCount = 0; targetCount = 0; recentOutcomes = []; updateExperimentInfo(); });
updateExperimentInfo();

const questions = [
  { text: 'What is the mean of 2, 4, and 6?', options: ['3', '4', '5', '12'], answer: 1, explanation: 'Add the values and divide by 3: (2 + 4 + 6) ÷ 3 = 4.' },
  { text: 'What is the median of 3, 5, 8, 10, and 12?', options: ['5', '7.6', '8', '10'], answer: 2, explanation: 'The numbers are already in order. The middle (third) value is 8.' },
  { text: 'A fair coin is flipped. What is the probability of heads?', options: ['1 in 4', '1 in 3', '1 in 2', 'Certain'], answer: 2, explanation: 'There are 2 equally likely outcomes, heads and tails, so heads has probability 1 in 2 (50%).' },
  { text: 'What is the range of 4, 7, 9, and 12?', options: ['8', '9', '12', '32'], answer: 0, explanation: 'Range = largest − smallest = 12 − 4 = 8.' }
];
let questionIndex = 0; let selectedAnswer = null; let score = 0; let answered = false;
const answers = $('#answers'); const action = $('#quiz-action');
function renderQuestion() {
  const item = questions[questionIndex];
  $('#quiz-count').textContent = `QUESTION ${questionIndex + 1} OF ${questions.length}`;
  $('#progress-fill').style.width = `${(questionIndex + 1) / questions.length * 100}%`;
  $('#question').textContent = item.text;
  $('#feedback').textContent = ''; $('#feedback').className = 'feedback';
  $('#score').textContent = `Score: ${score}`;
  answers.replaceChildren(); selectedAnswer = null; answered = false;
  item.options.forEach((text, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'answer'; button.textContent = text;
    button.addEventListener('click', () => {
      if (answered) return;
      selectedAnswer = index;
      answers.querySelectorAll('button').forEach((choice) => choice.classList.toggle('selected', choice === button));
      action.disabled = false; action.textContent = 'Check answer';
    });
    answers.append(button);
  });
  action.disabled = true; action.textContent = 'Check answer'; action.dataset.retry = 'false';
}
action.addEventListener('click', () => {
  if (action.dataset.retry === 'true') { questionIndex = 0; score = 0; renderQuestion(); return; }
  if (!answered) {
    if (selectedAnswer === null) return;
    answered = true; const item = questions[questionIndex]; const correct = selectedAnswer === item.answer;
    if (correct) score++;
    answers.querySelectorAll('button').forEach((button, index) => { button.disabled = true; if (index === item.answer) button.classList.add('correct'); else if (index === selectedAnswer) button.classList.add('incorrect'); });
    $('#feedback').textContent = `${correct ? 'Correct!' : 'Not quite.'} ${item.explanation}`;
    $('#feedback').classList.add(correct ? 'good' : 'bad'); $('#score').textContent = `Score: ${score}`;
    action.textContent = questionIndex === questions.length - 1 ? 'See results' : 'Next question';
  } else if (questionIndex < questions.length - 1) { questionIndex++; renderQuestion(); }
  else {
    $('#quiz-count').textContent = 'QUIZ COMPLETE'; $('#progress-fill').style.width = '100%';
    $('#question').textContent = score === questions.length ? 'Excellent work—you’re a statistics star!' : score >= 3 ? 'Great job—you understand the ideas well!' : 'Good try! Explore the activities and have another go.';
    answers.replaceChildren(); $('#feedback').textContent = `You scored ${score} out of ${questions.length}.`; $('#feedback').className = 'feedback good';
    action.textContent = 'Try again'; action.disabled = false; action.dataset.retry = 'true';
  }
});
renderQuestion();
