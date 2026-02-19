FROM node:18-alpine

WORKDIR /app

# Install dependencies before code to leverage caching
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
