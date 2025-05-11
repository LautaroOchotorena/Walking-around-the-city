# Use a base image with Python
FROM python:3.11.9

# Create and set the working directory
WORKDIR /app

# Copy your app code
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port expected by Hugging Face (7860)
EXPOSE 7860

# Run the Flask app
CMD ["python", "server.py"]
