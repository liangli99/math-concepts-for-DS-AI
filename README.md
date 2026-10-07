# Math Concepts — Mathematical Foundations for Data Science & AI

An interactive visual web platform for exploring and mastering the mathematical foundations of Data Science, Machine Learning, and Artificial Intelligence.

Designed and authored by **Prof. Liang Li**, synthesizing foundational mathematical theory with modern AI modeling and deep learning architectures.

---

## 🚀 Key Features & Interactive Labs

1. **Linear Algebra: The Language of Data**: Interactive data hierarchy explorer demonstrating the united mathematical continuum between raw Scalar Data ($x$), 1D Vectors ($\mathbf{x}$), 2D Matrices ($\mathbf{X}$), and 3D/4D Tensors ($\mathbf{\mathcal{X}}$) alongside temporal sliding-window time-series decomposition (Trend, Seasonality, Noise).
2. **Multivariable Calculus & Gradients**: Non-convex loss surface simulator comparing Vanilla SGD, SGD with Momentum, and the Adam optimizer with adjustable learning rates ($\alpha$).
3. **Statistical Regression Modeling**: Interactive polynomial curve fitter from degree $d=1$ to $d=5$, displaying real-time Ordinary Least Squares (OLS) Normal Equation solutions, $R^2$ goodness of fit, and MSE residual drops.
4. **Neural Networks as Non-Linear Regressors**: Forward pass neuron activation explorer supporting ReLU, GELU, Sigmoid, Tanh, and Leaky ReLU alongside their local gradient derivatives.
5. **Probability Theory & Distribution Explorer**: Continuous density function (PDF) visualizer for Gaussian, Exponential, and Uniform distributions with empirical $68-95-99.7$ rules and $\pm 2\sigma$ anomaly thresholds.
6. **Bayes' Theorem & Defect Attribution Lab**: Dynamic dual-supplier root cause simulator based on worked Bayesian inference ($A_1$ 65% / 2% defect vs. $A_2$ 35% / 5% defect $\rightarrow$ $P(A_2 | \text{Defect}) \approx 57.4\%$).
7. **Monte Carlo Simulation Studio**: Live stochastic sampler computing 1,000 to 10,000 portfolio trials with real-time frequency histograms, Value-at-Risk (VaR 95%), and 90% confidence spans.
8. **Clustering & Correlation Analysis**: Bivariate $(X, Y)$ coordinate feature space simulator demonstrating Centroids, WCSS Inertia, Mahalanobis distance, Pearson correlation, and live **Simpson's Paradox** detection.
9. **Optimization Theory & Constrained Models**: Constrained profit maximization solver $Z = (P \times Q) - FC - (VC \times Q) - (C_w \times W)$ with interactive capacity limits, CVP break-even curves, and profit sensitivity curves.
10. **Cross-Domain Synthesis Knowledge Matrix**: Filterable reference table mapping each mathematical pillar to real-world AI applications.
11. **Academic & Industry References**: Curated bibliography of textbooks, monographs, and research foundations.

---

## 🛠️ Architecture & Tech Stack

- **Core**: Vanilla HTML5, modern ES6+ JavaScript modules.
- **Styling**: Vanilla CSS3 design system with custom CSS variables, dark glassmorphism, responsive grid, and smooth micro-animations.
- **Math Engine**: KaTeX CDN for real-time mathematical typesetting.
- **Visuals**: HTML5 2D Canvas for responsive, high-performance visual simulations.
- **Zero Heavy Dependencies**: Can be opened directly in any modern web browser or served locally with any HTTP server.

---

## 💻 Running the Platform

Simply open `index.html` in your favorite browser:

```powershell
# Option 1: Open directly
Start-Process "e:\Antigravity_workspace\Math_Concept_for_DS_AI\index.html"

# Option 2: Run with Python HTTP server
python -m http.server 8080 --directory "e:\Antigravity_workspace\Math_Concept_for_DS_AI"
```
Then navigate to `http://localhost:8080` in your web browser.
