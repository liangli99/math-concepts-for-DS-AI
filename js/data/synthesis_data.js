/**
 * MathCore DS & AI — Synthesis Data & Knowledge Mapping Base
 */

const SYNTHESIS_DATA = [
  {
    id: 'linalg',
    module: 'Module 01',
    area: 'Linear Algebra',
    coreIdea: 'Vectors, matrices, tensors, rank, eigenvalues & eigenvectors, and SVD low-rank matrix decomposition providing structural data representations.',
    formula: '\\begin{aligned} \\mathbf{y} &= \\mathbf{W}\\mathbf{x} + \\mathbf{b} && \\text{(Neural Affine Layer)} \\\\ \\mathbf{A} &= \\mathbf{U}\\mathbf{\\Sigma}\\mathbf{V}^T, \\quad \\mathbf{A}\\mathbf{v} = \\lambda\\mathbf{v} && \\text{(SVD and Eigen-decomposition)} \\end{aligned}',
    exampleTechnique: 'PCA, SVD, Non-negative Matrix Factorization (NMF), Eigen-decomposition',
    applications: 'Dimensionality reduction, latent semantic analysis, recommendation systems (collaborative filtering), neural network layer operations, image compression',
    aiCategory: 'Representation & Deep Learning',
    complexity: 'Essential'
  },
  {
    id: 'time_series',
    module: 'Module 01 (Sub)',
    area: 'Time Series Analysis and Forecasting',
    coreIdea: 'Temporal sequence decomposition (Trend, Seasonality, Cycle, Noise), autoregressive models, out-of-sample point forecasting, and prediction error residual analysis.',
    formula: '\\begin{aligned} Y_t &= T_t + S_t + C_t + I_t, \\quad e_{t+h} = Y_{t+h} - \\hat{Y}_{t+h|t} \\\\ \\hat{Y}_{t+h|t} &= c + \\sum_{j=1}^p \\phi_j Y_{t+h-j} + \\sum_{k=1}^q \\theta_k \\varepsilon_{t+h-k} \\\\ \\text{RMSE} &= \\sqrt{\\frac{1}{H}\\sum_{h=1}^H e_{t+h}^2}, \\quad \\text{MAE} = \\frac{1}{H}\\sum_{h=1}^H |e_{t+h}| \\end{aligned}',
    exampleTechnique: 'Classical Decomposition, AR(p), ARIMA/SARIMA, Exponential Smoothing, LSTM/Temporal Transformers',
    applications: 'Demand & sales forecasting, retail inventory planning, real-time sensor anomaly detection via residual spikes, electricity grid load dispatch, macro-econometrics',
    aiCategory: 'Sequential Modeling & Forecasting',
    complexity: 'Intermediate'
  },
  {
    id: 'calculus',
    module: 'Module 02',
    area: 'Multivariable Calculus & Gradients',
    coreIdea: 'Transforming prediction error residuals into Mean Squared Error loss; partial derivatives, error-weighted gradient sums, and systematic coefficient parameter upgrades.',
    formula: '\\begin{aligned} e_i &= y_i - \\boldsymbol{\\theta}^T \\mathbf{x}_i, \\quad \\mathcal{L}(\\boldsymbol{\\theta}) = \\frac{1}{N} \\sum_{i=1}^N e_i^2 = \\frac{1}{N} \\|\\mathbf{y} - \\mathbf{X}\\boldsymbol{\\theta}\\|^2 \\\\ \\nabla_{\\boldsymbol{\\theta}} \\mathcal{L} &= -\\frac{2}{N} \\mathbf{X}^T \\mathbf{e}, \\quad \\boldsymbol{\\theta}^{(t+1)} = \\boldsymbol{\\theta}^{(t)} + \\frac{2\\alpha}{N} \\mathbf{X}^T \\mathbf{e}^{(t)} \\\\ \\delta_j^{(l)} &= \\frac{\\partial \\mathcal{L}}{\\partial z_j^{(l)}}, \\quad \\mathbf{W}^{(l)(t+1)} = \\mathbf{W}^{(l)(t)} + \\alpha \\boldsymbol{\\delta}^{(l)} (\\mathbf{a}^{(l-1)})^T \\end{aligned}',
    exampleTechnique: 'Gradient Descent, Stochastic Gradient Descent (SGD), Momentum, Adam, RMSProp, Backpropagation',
    applications: 'Transforming forecasting errors into optimal weights, training deep neural networks, loss landscape traversal, rate-of-change sensitivity analysis',
    aiCategory: 'Optimization & Parameter Upgrades',
    complexity: 'Essential'
  },
  {
    id: 'regression',
    module: 'Module 03',
    area: 'Statistical Regression Analysis',
    coreIdea: 'Modeling functional relationships between independent covariates and dependent response, Ordinary Least Squares residual minimization, and regularization.',
    formula: '\\begin{aligned} y &= \\beta_0 + \\sum_{j=1}^p \\beta_j x_j + \\varepsilon, \\quad \\varepsilon \\sim \\mathcal{N}(0, \\sigma^2) \\\\ \\hat{\\boldsymbol{\\beta}} &= (\\mathbf{X}^T \\mathbf{X})^{-1} \\mathbf{X}^T \\mathbf{y}, \\quad R^2 = 1 - \\frac{\\text{SSE}}{\\text{SST}} \\\\ P(y=1|\\mathbf{x}) &= \\sigma(\\boldsymbol{\\beta}^T \\mathbf{x}) = \\frac{1}{1 + e^{-\\boldsymbol{\\beta}^T \\mathbf{x}}} \\end{aligned}',
    exampleTechnique: 'Ordinary Least Squares (OLS), Ridge ($L_2$) / Lasso ($L_1$) Regularization, Polynomial Regression, Logistic Regression',
    applications: 'Econometric inference, sales & demand baseline benchmarking, clinical risk scoring, customer churn probability estimation',
    aiCategory: 'Predictive Modeling',
    complexity: 'Foundational'
  },
  {
    id: 'neural_nets',
    module: 'Module 04',
    area: 'Neural Networks (Extended Regression)',
    coreIdea: 'Layered affine matrix transformations interleaved with non-linear activation functions to universally approximate complex continuous functions.',
    formula: '\\begin{aligned} \\mathbf{a}^{(l)} &= \\sigma\\left(\\mathbf{W}^{(l)}\\mathbf{a}^{(l-1)} + \\mathbf{b}^{(l)}\\right), \\quad \\text{GELU}(z) = z \\cdot \\Phi(z) \\\\ \\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) &= \\text{softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^T}{\\sqrt{d_k}}\\right)\\mathbf{V} \\end{aligned}',
    exampleTechnique: 'Multi-Layer Perceptrons (MLP), LSTMs/GRUs, Convolutional Networks (CNNs), Transformers & Multi-Head Self-Attention',
    applications: 'Large Language Models (LLMs), computer vision feature extraction, non-linear sensor modeling, generative AI foundation models',
    aiCategory: 'Deep Learning',
    complexity: 'Advanced'
  },
  {
    id: 'probability',
    module: 'Module 05',
    area: 'Probability Concepts & Distributions',
    coreIdea: 'Single event likelihood $P(A)$ vs. complete probability distributions (discrete PMF, continuous PDF, CDF), distribution moments, and canonical parametric models.',
    formula: '\\begin{aligned} P(A) &= \\frac{|A|}{|\\Omega|} \\in [0, 1], \\quad P(a \\le X \\le b) = \\int_a^b f(x)\\,dx \\\\ \\mu &= E[X] = \\int_{-\\infty}^\\infty x f(x)\\,dx, \\quad \\sigma^2 = \\text{Var}(X) = E[X^2] - \\mu^2 \\\\ \\mathcal{N}(\\mu,\\sigma^2): f(x) &= \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}, \\; \\text{Exp}(\\lambda): f(x) = \\lambda e^{-\\lambda x}, \\; \\mathcal{U}(a,b): f(x) = \\frac{1}{b-a} \\end{aligned}',
    exampleTechnique: 'Gaussian $\\mathcal{N}(\\mu, \\sigma^2)$, Exponential $\\text{Exp}(\\lambda)$, Uniform $\\mathcal{U}(a, b)$, Discrete PMF, Central Limit Theorem (CLT)',
    applications: 'Residual noise analysis, A/B test hypothesis validation, anomaly detection outlier gating (2σ/3σ rules), reliability and latency distributions',
    aiCategory: 'Statistical Inference & Uncertainty',
    complexity: 'Foundational'
  },
  {
    id: 'bayes',
    module: 'Module 06',
    area: 'Bayesian Inference & Conditional Probability',
    coreIdea: 'Inverting conditional likelihoods to iteratively update belief distributions based on observed empirical evidence and prior distributions.',
    formula: '\\begin{aligned} P(A_i | B) &= \\frac{P(B | A_i) P(A_i)}{\\sum_{j} P(B | A_j) P(A_j)} = \\frac{\\text{Likelihood} \\times \\text{Prior}}{\\text{Evidence}} \\\\ P(y \\mid \\mathbf{x}) &\\propto P(y) \\prod_{i=1}^d P(x_i \\mid y) \\quad \\text{(Naïve Bayes)} \\end{aligned}',
    exampleTechnique: 'Bayes Theorem, Naïve Bayes Classifier, Bayesian Optimization (Gaussian Processes), Markov Chain Monte Carlo (MCMC)',
    applications: 'Spam & phishing classification, medical diagnostic screening, dynamic Bayesian A/B testing, supply chain defect root-cause attribution',
    aiCategory: 'Probabilistic AI',
    complexity: 'Intermediate'
  },
  {
    id: 'monte_carlo',
    module: 'Module 07',
    area: 'Monte Carlo Simulation & Risk Analysis',
    coreIdea: 'Repeated pseudo-random stochastic sampling from probability distributions to model complex systems, estimate expectations, and evaluate tail risk bounds.',
    formula: '\\begin{aligned} E[f(X)] &\\approx \\frac{1}{N} \\sum_{i=1}^N f(x_i), \\quad x_i \\sim P(X), \\quad \\text{Error} \\sim \\mathcal{O}\\left(\\frac{1}{\\sqrt{N}}\\right) \\\\ \\text{VaR}_{1-\\alpha} &= -\\inf\\{l \\mid P(L > l) \\le \\alpha\\} \\quad \\text{(Value-at-Risk 95\\%)} \\end{aligned}',
    exampleTechnique: 'Live random sampling, Monte Carlo Rollouts, Latin Hypercube Sampling, Value-at-Risk (VaR 95%), Monte Carlo Dropout',
    applications: 'Financial portfolio risk calculation, derivative option pricing, stochastic inventory policy optimization, AI inference uncertainty estimation',
    aiCategory: 'Stochastic Simulation',
    complexity: 'Intermediate'
  },
  {
    id: 'clustering-correlation',
    module: 'Module 08',
    area: 'Clustering & Correlation Analysis',
    coreIdea: 'Geometric partitioning of $(X, Y)$ coordinate feature spaces around centroids $\\mathbf{c}_k$, linear/rank co-movement, and detecting Simpson\'s Paradox.',
    formula: '\\begin{aligned} J_{\\text{WCSS}} &= \\sum_{k=1}^K \\sum_{\\mathbf{x}_i \\in S_k} \\|\\mathbf{x}_i - \\mathbf{c}_k\\|^2, \\quad \\mathbf{c}_k = \\frac{1}{|S_k|} \\sum_{\\mathbf{x}_i \\in S_k} \\mathbf{x}_i \\\\ \\rho(X, Y) &= \\frac{\\text{Cov}(X,Y)}{\\sigma_X \\sigma_Y} \\in [-1, 1], \\quad D_M(\\mathbf{x}, \\mathbf{c}_k) = \\sqrt{(\\mathbf{x} - \\mathbf{c}_k)^T \\mathbf{\\Sigma}_k^{-1} (\\mathbf{x} - \\mathbf{c}_k)} \\end{aligned}',
    exampleTechnique: 'K-Means, DBSCAN, Gaussian Mixture Models (GMM), Pearson $\\rho$, Spearman rank $r_s$, Simpson\'s Paradox diagnostic',
    applications: 'Latent embedding clustering, customer RFM behavioral segmentation, Vector DB nearest-neighbor indexing (IVF-PQ/FAISS), multicollinearity elimination, fraud detection',
    aiCategory: 'Unsupervised Learning & Feature Geometry',
    complexity: 'Intermediate'
  },
  {
    id: 'optimization',
    module: 'Module 09',
    area: 'General Optimization Theory & Constrained Models',
    coreIdea: 'Selecting optimal decision vectors $\\mathbf{x}^*$ subject to inequality and equality constraints; Lagrange multipliers, KKT conditions, and industrial profit break-even.',
    formula: '\\begin{aligned} \\min_{\\mathbf{x} \\in \\mathbb{R}^n} f(\\mathbf{x}) \\quad &\\text{s.t.} \\quad g_i(\\mathbf{x}) \\le 0, \\quad h_j(\\mathbf{x}) = 0 \\\\ \\mathcal{L}(\\mathbf{x}, \\boldsymbol{\\lambda}, \\boldsymbol{\\mu}) &= f(\\mathbf{x}) + \\sum_{i=1}^m \\lambda_i g_i(\\mathbf{x}) + \\sum_{j=1}^p \\mu_j h_j(\\mathbf{x}), \\quad \\lambda_i g_i(\\mathbf{x}^*) = 0 \\\\ \\max_{Q} Z(Q) &= (P \\cdot Q) - \\left[FC + (VC \\cdot Q) + (C_w \\cdot w \\cdot Q)\\right] \\\\ Q_{\\text{BE}} &= \\frac{FC}{P - VC - C_w \\cdot w} \\quad \\big(Z(Q_{\\text{BE}}) = 0\\big) \\end{aligned}',
    exampleTechnique: 'Linear Programming (Simplex), Quadratic Programming, Lagrange Multipliers, Karush-Kuhn-Tucker (KKT) Conditions, CVP Sensitivity Analysis',
    applications: 'Enterprise profit maximization, factory capacity scheduling, supply chain logistics routing, portfolio Markowitz efficient frontier, hyperparameter search',
    aiCategory: 'Operations Research & Decision Theory',
    complexity: 'Advanced'
  }
];

// Reference resources from document & search
const ACADEMIC_REFERENCES = [
  {
    title: "Mathematics for Machine Learning and Data Science Specialization",
    author: "Coursera / DeepLearning.AI",
    url: "https://www.coursera.org/specializations/mathematics-for-machine-learning-and-data-science",
    tag: "Course Series"
  },
  {
    title: "What Is Linear Algebra for Machine Learning?",
    author: "IBM Think Topics",
    url: "https://www.ibm.com/think/topics/linear-algebra-for-machine-learning",
    tag: "Technical Primer"
  },
  {
    title: "Bayes' Theorem Explained with Examples",
    author: "Ace Tutors (YouTube Lecture)",
    url: "https://www.youtube.com/watch?v=cqTwHnNbc8g",
    tag: "Video Guide"
  },
  {
    title: "Introduction to Optimization: Objective Function & Decision Variables",
    author: "Aophasopt (YouTube Lecture)",
    url: "https://www.youtube.com/watch?v=AoJQS10Ewn4",
    tag: "Video Guide"
  },
  {
    title: "Regression Analysis & Statistical Diagnostics",
    author: "CLOSER Video Archives",
    url: "https://www.youtube.com/watch?v=vPde9bYrr80",
    tag: "Video Guide"
  },
  {
    title: "Introducing Time Series Analysis and Forecasting",
    author: "Dr Nic's Maths & Stats",
    url: "https://www.youtube.com/watch?v=GUq_tO2BjaU",
    tag: "Video Guide"
  },
  {
    title: "How to Perform Monte Carlo Simulation for Risk Analysis",
    author: "Engineeingly Lecture",
    url: "https://www.youtube.com/watch?v=nDbmE0LlKQc",
    tag: "Video Guide"
  },
  {
    title: "Linear Algebra for Data Science: Complete Guide",
    author: "upGrad Research",
    url: "https://www.upgrad.com/blog/linear-algebra-for-data-science/",
    tag: "Technical Blog"
  }
];
