# Use Node 20 alpine as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the default Angular CLI port
EXPOSE 4200

# Start the Angular development server bound to all network interfaces
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
