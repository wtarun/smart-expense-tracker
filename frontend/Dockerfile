FROM node:20-alpine

WORKDIR /app

# Install deps first — cached layer unless package.json changes
COPY package*.json ./
RUN npm install

# Source is volume-mounted at runtime for hot reload; COPY is for image-only builds
COPY . .

EXPOSE 5173

# --host binds Vite to 0.0.0.0 so Docker can expose the port
CMD ["npm", "run", "dev", "--", "--host"]
