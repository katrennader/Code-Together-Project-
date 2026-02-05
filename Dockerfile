# Use Node.js base image
FROM node:20-bullseye

# Install Python & g++ for Python and C++ code execution
RUN apt-get update && apt-get install -y python3 python3-pip g++ && apt-get clean

# Set working directory
WORKDIR /app

# Copy all project files into container
COPY . .

# Install Node.js dependencies
RUN npm install --omit=dev

# Set environment variable for port (optional)
ENV PORT=8080

# Start Node.js server
CMD ["node", "server.js"]
