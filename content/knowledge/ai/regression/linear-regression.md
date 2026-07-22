---
title: Linear regression
rank: 1
tags:
  - AI
---

## Principle

Let $X \in \mathbb{R}^{n\times p}$ be the feature matrix, $Y \in \mathbb{R}^n$ the vector
of observations and $\beta \in \mathbb{R}^p$ the weight vector. We look for the $\beta$
that minimises the following quantity:

$$
J(\beta) = \left\lVert Y - X\beta \right\rVert^2
$$

We find the $\beta$ minimising the quantity by setting the derivative to zero:

$$
\frac{\partial}{\partial \beta}J(\beta) = 0
$$

Now:

$$
\begin{aligned}
\frac{\partial}{\partial \beta}J(\beta)
&= \frac{\partial}{\partial \beta} \left\lVert Y - X \beta \right\rVert^2
= \frac{\partial}{\partial \beta}\langle Y-X\beta,\ Y-X\beta\rangle \\
&= \frac{\partial}{\partial \beta}\left( \langle Y,Y\rangle -2 \langle Y, X\beta\rangle + \langle X\beta,X\beta\rangle \right) \\
&= \frac{\partial}{\partial \beta} \left(-2\langle X^TY,\beta\rangle+\langle X^TX\beta, \beta\rangle\right) \\
&= -2X^TY + 2 X^TX\beta
\end{aligned}
$$

Hence:

$$
\frac{\partial}{\partial \beta}J(\beta) = 0 \implies X^TY = X^TX\beta
$$

So $\beta$ is only defined if $(X^TX)^{-1}$ exists, and therefore if $X$ has full rank. We
then have:

$$
\beta = (X^TX)^{-1}X^TY
$$

## Link with ANOVA

Let $\bar{y} = \frac{1}{n}\sum_{i=1}^nY_i$ be the mean of the observations, $\bar{Y}$ the
vector of the $\bar{y}$ and $\hat{Y} = X\beta$ the vector of predictions. We define the
following three quantities:

- The variance of the observations (or SST, Sum of Total Squares):

$$
SST = \sum_{i=1}^n \left(Y_i - \bar{y} \right) ^2 = \left\lVert Y - \bar{Y} \right\rVert^2
$$

- The unexplained variance of the regressors (or SSE, Sum of Squared Errors):

$$
SSE = \sum_{i=1}^n \left( Y_i - \hat{Y}_i \right) ^2 = \left\lVert Y - \hat{Y}\right\rVert^2
$$

- The variance of the predictions around the mean of the observations, i.e. the explained variance (or SSR, Sum of Squares due to Regression):

$$
SSR = \sum_{i=1}^n \left( \hat{Y}_i - \bar{y} \right)^2 = \left\lVert \hat{Y} - \bar{Y} \right\rVert^2
$$

We have the following relation:

$$
SST = SSE + SSR
$$

Indeed:

$$
\begin{aligned}
\text{SST} &= \left\lVert Y - \bar{Y} \right\rVert^2 = \left\lVert Y - \bar{Y} - \hat{Y} + \hat{Y} \right\rVert^2 \\
&= \left\langle Y - \bar{Y} - \hat{Y} + \hat{Y},\ Y - \bar{Y} - \hat{Y} + \hat{Y} \right\rangle \\
&= \left\langle (Y - \hat{Y}) + (\hat{Y} - \bar{Y}),\ (Y - \hat{Y}) + (\hat{Y} - \bar{Y}) \right\rangle \\
&= \left\langle Y - \hat{Y},\ Y - \hat{Y} \right\rangle + 2 \left\langle Y - \hat{Y},\ \hat{Y} - \bar{Y} \right\rangle + \left\langle \hat{Y} - \bar{Y},\ \hat{Y} - \bar{Y} \right\rangle \\
&= \left\lVert Y - \hat{Y} \right\rVert^2 + 2 \left\langle Y - \hat{Y},\ \hat{Y} - \bar{Y} \right\rangle + \left\lVert \hat{Y} - \bar{Y} \right\rVert^2 \\
&= \text{SSE} + 2 \left\langle Y - \hat{Y},\ \hat{Y} - \bar{Y} \right\rangle + \text{SSR} \\
&= \text{SSE} + 2 \left( \left\langle Y - \hat{Y},\ \hat{Y} \right\rangle - \left\langle Y - \hat{Y},\ \bar{Y} \right\rangle \right) + \text{SSR}
\end{aligned}
$$

Now:

$$
\begin{aligned}
\left\langle Y - \hat{Y},\ \hat{Y} \right\rangle
&= \left\langle Y - X\beta,\ X\beta \right\rangle
= \left\langle X^T Y - X^T X \beta,\ \beta \right\rangle \\
&= \left\langle X^T Y - X^T X (X^T X)^{-1} X^T Y,\ \beta \right\rangle \\
&= \left\langle X^T Y - X^T Y,\ \beta \right\rangle = 0
\end{aligned}
$$

And by choosing the intercept $\beta_0$, we also have:

$$
\left\langle Y - \hat{Y},\ \bar{Y} \right\rangle = 0
$$

Hence the equation.

## Performance measure

The $R^2$ measures the share of variance explained by the model:

$$
R^2 = 1 - \frac{\text{SSE}}{\text{SST}}
$$

But $R^2$ always increases when you add variables, even useless ones.

We then define the adjusted $\tilde{R}^2$, which penalises model complexity:

$$
\tilde{R}^2 = 1 - \frac{\text{SSE} / (n - k - 1)}{\text{SST} / (n - 1)}
$$

with:

- $n$ the number of observations
- $k$ the number of explanatory variables (excluding the intercept)

## Lasso penalty (L1)

We define the new quantity to minimise:

$$
J(\beta) = \left\lVert Y - X\beta \right\rVert^2 + \lambda \left\lVert \beta \right\rVert_1
$$

The term $\left\lVert \beta \right\rVert_1$ is not differentiable (at zero, for example). So
we use numerical methods to compute the solution:

- Coordinate Descent: updates each coefficient one by one, applying a soft-thresholding at each step (for different thresholds $\lambda$; the larger the threshold, the more the soft-thresholding zeroes out values around zero).

![[soft-thresholding.png]]

- LARS adds the variables progressively, choosing at each step the one most correlated with the current residual.
- ISTA/FISTA use the proximal gradient to handle the L1 penalty, combining gradient descent and soft-thresholding.

## Ridge penalty (L2)

We define the new quantity to minimise:

$$
J(\beta) = \left\lVert Y - X\beta \right\rVert^2 + \lambda \left\lVert \beta \right\rVert_2^2
$$

We recover the estimator as follows:

$$
\begin{aligned}
J(\beta) &= \left\lVert Y - X\beta \right\rVert^2 + \lambda \left\lVert \beta \right\rVert^2 \\
&= \left\langle Y - X\beta,\ Y - X\beta \right\rangle + \lambda \left\lVert \beta \right\rVert^2 \\
&= \left\lVert Y \right\rVert^2 - 2 \left\langle X^T Y,\ \beta \right\rangle + \left\langle X^T X \beta,\ \beta \right\rangle + \lambda \left\lVert \beta \right\rVert^2
\end{aligned}
$$

We therefore have:

$$
\frac{\partial}{\partial \beta}J(\beta) = -2X^TY + 2X^TX\beta + 2 \lambda \beta
$$

And so, setting the derivative to zero, we get:

$$
\beta = (X^TX + \lambda I)^{-1}X^TY
$$

The matrix $(X^TX + \lambda I)^{-1}$ is indeed invertible because:

- We only add elements on the diagonal, so $(X^TX + \lambda I)$ is symmetric.
- The matrix is therefore invertible if it is positive definite (all eigenvalues strictly positive).

Now, for any vector $x$:

$$
\begin{aligned}
\langle x,\ (X^\top X + \lambda I)x \rangle &= \langle x,\ X^\top X x \rangle + \lambda \|x\|^2 \\
&= x^\top X^\top X x + \lambda \|x\|^2 \\
&= (X x)^\top X x + \lambda \|x\|^2 \\
&= \|X x\|^2 + \lambda \|x\|^2 > 0
\end{aligned}
$$

With this penalty, we penalise within a penalisation sphere. We do not try to set
coefficients to zero.

- If $\lambda$ is large, we heavily penalise $\lambda \left\lVert \beta \right\rVert_2^2$ and therefore increase the model's bias.
- If $\lambda$ is small, we penalise $\left\lVert Y - X\beta \right\rVert^2$ instead and therefore increase the model's variance.

## Elastic Net

We combine the Ridge and Lasso penalties. Let $\alpha \in [0,1]$ and $\lambda > 0$; we
minimise the quantity:

$$
J(\beta) = \lVert Y - X\beta \rVert_2^2 + \lambda \left( \alpha \lVert \beta \rVert_1 + (1 - \alpha) \lVert \beta \rVert_2^2 \right)
$$
