# Statistics and Probability for JHS

An interactive, browser-based learning tool for Junior High School students exploring data handling, averages, charts, and probability.

## Activities

- **Data explorer:** enter up to 20 whole numbers and view the frequency bar chart, mean, median, mode, and range. Handles even-sized data sets, tied modes, and data with no repeated value.
- **Probability simulator:** run coin flips, die rolls, or spinner trials in batches of 10. Compare experimental probability with the theoretical probability, with a record of recent outcomes.
- **Practice quiz:** four multiple-choice questions with explanations, instant feedback, scoring, and retry.
- Responsive design; no build process or runtime dependencies.

## Run locally

Open `index.html` in a current browser, or start a local static server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, then save. GitHub Pages will show the published URL after deployment completes.

## Ideas covered

- Organising and representing data with a frequency bar chart
- Mean, median, mode, and range
- Theoretical and experimental probability
- How experimental results can vary by chance

## Files

- `index.html` — activities and page structure
- `styles.css` — responsive visual design
- `script.js` — statistics, chart, probability simulator, and quiz interactions
