---
title: Classification metrics
tags:
  - AI
---

## Accuracy

The share of correct predictions.

$$
\text{Accuracy} = \frac{\text{Number of correct predictions}}{\text{Total number of predictions}} = \frac{TP + TN}{TP + TN + FP + FN}
$$

Not suitable when the classes are imbalanced.

## Balanced Accuracy

The average of the recalls over all classes. More balanced than accuracy.

$$
\text{Balanced Accuracy} = \frac{1}{C} \sum_{i=1}^{C} \frac{TP_i}{TP_i + FN_i}
$$

## Recall / Sensitivity

The proportion of true positives correctly detected among all the real positives. The
ability to catch every positive.

$$
\text{TPR} = \frac{TP}{TP + FN}
$$

Raising the threshold (predict positive if proba > threshold):

- TP ↘
- FP ↘

- TN **↗**
- FN **↗**

TPR ↘

Example: fraud detection

- Positive = fraud
    - TP = detected fraud
    - FN = missed fraud
- Negative = not fraud
    - FP = false alarm
    - TN = correctly cleared non-fraud

$$
\text{TPR} = \frac{\text{detected fraud}}{\text{detected fraud} + \text{missed fraud}}
$$

TPR = 90% ⇒ out of 100 frauds, the model catches 90.

## Precision

The proportion of correct positive predictions among all the positive predictions. The
purity of the prediction.

$$
\text{Precision} = \frac{TP}{TP + FP}
$$

Raising the threshold (predict positive if proba > threshold):

- TP ↘
- FP ↘

- TN **↗**
- FN **↗**

Precision ↗

Example: fraud detection

- Positive = fraud
    - TP = detected fraud
    - FN = missed fraud
- Negative = not fraud
    - FP = false alarm
    - TN = correctly cleared non-fraud

$$
\text{Precision} = \frac{\text{detected fraud}}{\text{detected fraud} + \text{false alarms}}
$$

Precision = 80% ⇒ out of 100 flagged frauds, 80 are truly frauds.

## Specificity

The proportion of true negatives correctly detected among all the real negatives. Used
together with recall for the ROC curve.

$$
\text{TNR} = \frac{TN}{TN + FP}
$$

Raising the threshold (predict positive if proba > threshold):

- TP ↘
- FP ↘

- TN **↗**
- FN **↗**

TNR ↗

Example: fraud detection

- Positive = fraud
    - TP = detected fraud
    - FN = missed fraud
- Negative = not fraud
    - FP = false alarm
    - TN = correctly cleared non-fraud

$$
\text{TNR} = \frac{\text{cleared non-fraud}}{\text{cleared non-fraud} + \text{false alarms}}
$$

TNR = 80% ⇒ out of 100 predicted non-frauds, 80 are truly non-frauds.

## F1-Score

The harmonic mean of precision and recall (sensitivity), useful for balancing false
positives and false negatives. It drops quickly if either precision or recall drops.

$$
\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall (TPR)}}{\text{Precision} + \text{Recall (TPR)}}
$$

Which comes down to:

$$
\text{F1} = 2 \times \frac{
\left( \dfrac{TP}{TP + FP} \right)
\times
\left( \dfrac{TP}{TP + FN} \right)
}{
\left( \dfrac{TP}{TP + FP} \right)
+
\left( \dfrac{TP}{TP + FN} \right)
} = \dots \boxed{=\frac{2\text{TP}}{2\text{TP}+ \text{FN} + \text{FP}} = \frac{\text{TP}}{\text{TP}+ \frac{1}{2}\text{FN} + \frac{1}{2}\text{FP}}}
$$

Raising the threshold (predict positive if proba > threshold):

- TP ↘
- FP ↘

- TN **↗**
- FN **↗**

F1: it depends.

Usually ends up ↘.

## Confusion matrix

A complete representation that gathers all the elements (TP, TN, FP, FN) to better
understand the model's performance.

*(No equation here, but usually a table.)*

## Entropy

A measure of the impurity of a group, of its heterogeneity. Considering a set of
individuals split across classes, entropy measures the amount of information needed, on
average, to identify the class of a randomly drawn individual.

$$
\text{Entropy} = -\sum_{c=1}^C p_c \log_2(p_c)
$$

- $p_c$ is the proportion of individuals of class $c$ in the set.
- dominant class ⇒ $p_c \approx 1$ ⇒ $-\log_2(p_c) \approx 0$ ⇒ $\text{entropy} \approx 0$
- evenly spread classes ⇒ all $p_c < 1$ ⇒ $\log_2(p_c) << 0$ ⇒ $-\log_2(p_c) >> 0$ ⇒ $\text{entropy} >> 0$

![[log2-function.png]]

*log2 function*

## Gini impurity

Also measures impurity, but is simpler to compute than entropy.

$$
\text{Gini index} = 1 - \sum_{c=1}^C p_c^2
$$

Indeed, let us set:

- $C = 2$
- $\forall i \in \llbracket1, 2\rrbracket, p_i = \frac{1}{2}+\varepsilon$

We then have:

$$
\text{entropy} = -\left(\frac{1}{2} + \varepsilon\right) \log_2\left(\frac{1}{2} + \varepsilon\right) - \left(\frac{1}{2} - \varepsilon\right)\log_2\left(\frac{1}{2} - \varepsilon\right)
$$

Now:

$$
\log_2(1 + x) \approx \frac{x}{\ln 2} - \frac{x^2}{2 \ln 2} + o(x^2)
$$

Hence:

$$
H\left(\frac{1}{2} + \varepsilon\right) \approx 1 - \frac{2\varepsilon^2}{\ln 2}
$$

## ROC curve and ROC-AUC

**ROC** (Receiver Operating Characteristic): the curve of TPR (sensitivity) against FPR
(False Positive Rate). You vary the threshold used to compute TP, FP, TN, FN in order to
get the different TPR and FPR values.

$$
\text{TPR} = \frac{TP}{TP + FN}
$$

$$
FPR = \frac{FP}{FP + TN}
$$

![[roc-curve.png]]

**AUC** (Area Under Curve): the area under the ROC curve, a global performance indicator.
The closer the area is to 1, the better the model. With the rectangle method it gives:

$$
\text{ROC-AUC} = \sum_{n} (FPR_n - FPR_{n-1}) \cdot TPR_n
$$

**Why avoid it when the classes are imbalanced?**

For example, with fraud detection:

- Very little fraud
- So a lot of data correctly labelled as non-fraud (TN)
- So a huge denominator for FPR (FP + TN), and a small FPR
- So the FPR grows very slowly as you lower the threshold
- Meanwhile the TPR rises fast (few positives, so each captured TP has a big impact)
- So the curve climbs steeply and vertically before moving horizontally
- So the area under the curve is artificially inflated
- A mediocre model can reach an AUC of 0.95+ while having very low precision (many false alarms drowned in the mass of TN)

## PR curve and PR-AUC

**PR** (Precision - Recall): the curve of precision against sensitivity (TPR / recall).

$$
\text{Precision} = \frac{TP}{TP + FP}
$$

$$
\text{TPR} = \frac{TP}{TP + FN}
$$

**AUC** (Area Under Curve): the area under the PR curve, a global performance indicator.
The closer the area is to 1, the better the model.

$$
\text{PR-AUC} = \sum_{n} (TPR_n - TPR_{n-1}) \cdot \text{Precision}_n
$$

Unlike the ROC, where a random classifier gives the diagonal (AUC = 0.5), in PR the
baseline of a random classifier is a horizontal line at y = the proportion of positives.
So with 1% fraud, the baseline sits at 0.01, and a good model has to be significantly above
it.

**Why use it when the classes are imbalanced?**

For example, with fraud detection:

- Precision = TP / (TP + FP) has no TN in its formula
- So it is not "diluted" by the mass of negatives
- If the model produces 500 FP for 80 TP, precision = 80/580 ≈ 14% → it shows immediately
- Whereas on the ROC, those 500 FP gave an FPR of only 0.05
- The PR curve punishes false alarms directly, the ROC hides them

## Log Loss (Cross-Entropy Loss)

Measures the performance of probabilistic models by penalising wrong and confident
predictions.

$$
\text{LogLoss} = - \frac{1}{N} \sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]
$$

## Matthews Correlation Coefficient (MCC)

Measures a correlation between the real and predicted classes, robust to imbalance.

$$
MCC = \frac{TP \times TN - FP \times FN}{\sqrt{(TP+FP)(TP+FN)(TN+FP)(TN+FN)}}
$$
