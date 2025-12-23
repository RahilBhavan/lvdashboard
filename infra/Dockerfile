# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (e.g., for numpy/pandas compilation if needed)
RUN apt-get update && apt-get install -y gcc

# Copy requirements file
COPY requirements.txt .

# Install python dependencies
# Assuming requirements.txt contains: web3, pandas, arch, python-dotenv
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the keeper bot
CMD ["python", "scripts/keepers/bot.py"]
