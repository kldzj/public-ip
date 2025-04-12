# Public IP

A lightweight service that displays your server's public IPv4 and IPv6 addresses. Access your IP information through a clean web interface or via JSON endpoints.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🌐 Real-time display of public IPv4 and IPv6 addresses
- 🔄 Automatic IP refreshing every 15 seconds (configurable)
- 🧩 REST API endpoints for programmatic access
- 🐳 Docker support for easy deployment

## Quick Start

### Running with Node.js

```bash
# Install dependencies
yarn install

# Development mode
yarn dev

# Production build
yarn build
yarn start
```

### Using Docker

```bash
# Build the image locally
docker build -t public-ip .

# Run the container
docker run -p 3000:3000 public-ip
```

### Using Prebuilt Images

Prebuilt images are available on GitHub Container Registry (GHCR) for both AMD64 and ARM64 architectures:

```bash
# Pull the latest image
docker pull ghcr.io/kldzj/public-ip:latest

# Run using the prebuilt image
docker run -p 3000:3000 ghcr.io/kldzj/public-ip:latest

# Or use a specific version
docker run -p 3000:3000 ghcr.io/kldzj/public-ip:1.0.0
```

## API Endpoints

| Endpoint   | Description                                      |
| ---------- | ------------------------------------------------ |
| `/`        | Web interface displaying IPv4 and IPv6 addresses |
| `/json`    | Returns both IPv4 and IPv6 addresses as JSON     |
| `/json/v4` | Returns only IPv4 address as JSON                |
| `/json/v6` | Returns only IPv6 address as JSON                |

## Configuration

The following environment variables can be used to configure the application:

| Variable    | Default           | Description                                    |
| ----------- | ----------------- | ---------------------------------------------- |
| `PORT`      | `3000`            | Server port                                    |
| `IPV4_HOST` | `v4.ip.kldzj.dev` | IPv4 lookup service                            |
| `IPV6_HOST` | `v6.ip.kldzj.dev` | IPv6 lookup service                            |
| `PROTOCOL`  | `https`           | Protocol for lookup services (http or https)   |
| `INTERVAL`  | `15000`           | IP refresh interval in milliseconds            |
| `TIMEOUT`   | `5000`            | Timeout for IP lookup requests in milliseconds |

## Contributing

Contributions are welcome! Here are some guidelines to get started:

1. **Fork the repository** and clone it locally
2. **Create a new branch** for your feature or bugfix
3. **Make your changes** following the existing code style
4. **Test your changes** thoroughly
5. **Submit a pull request** describing the changes you've made

For major changes, please open an issue first to discuss what you would like to change.

## License

MIT © [Nikolai Kolodziej](https://github.com/kldzj)
