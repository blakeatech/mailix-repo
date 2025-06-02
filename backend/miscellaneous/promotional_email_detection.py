import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

# Load the data
df = pd.read_csv('app/data/synthetic_emails.csv')

# Split the data into features (X) and target (y)
X = df['body']
y = df['promotional']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create a pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('classifier', MultinomialNB())
])

# Train the model
pipeline.fit(X_train, y_train)

# Make predictions on the test set
y_pred = pipeline.predict(X_test)

# Print the classification report and accuracy
print(classification_report(y_test, y_pred))
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")

# Function to predict if a new email is promotional
def predict_promotional(email_body):
    return pipeline.predict([email_body])[0]

# Example usage
example_promotional_email = "Get 50% off on all products! Limited time offer!"
example_non_promotional_email = """
Out of curiosity, does the degree requirements table you built calculate the shortest path to graduation for a student? For example, if a course can satisfy two requirements for a particular major, does it account for that?

I imagine there would be multiple paths that they could take to finish their degree requirements.
"""

promotional_result = predict_promotional(example_promotional_email)
non_promotional_result = predict_promotional(example_non_promotional_email)
print(f"Is the email promotional? {'Yes' if promotional_result else 'No'}")
print(f"Is the email promotional? {'Yes' if non_promotional_result else 'No'}")

# Save the model
import joblib
joblib.dump(pipeline, 'app/models/notaic_email_classifier.joblib')