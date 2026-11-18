FROM node:22-alpine
WORKDIR /app
# Install runtime deps first so this layer is cached between code changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server.js ./
COPY storage ./storage
COPY public ./public
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data
VOLUME /data
EXPOSE 3000
CMD ["node", "server.js"]
