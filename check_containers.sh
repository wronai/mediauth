#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check container status
check_container() {
    local container_name=$1
    local status=$(docker inspect -f '{{.State.Status}}' "$container_name" 2>/dev/null)
    local health=$(docker inspect -f '{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-healthcheck")
    local exit_code=$(docker inspect -f '{{.State.ExitCode}}' "$container_name" 2>/dev/null)
    
    echo -e "\n${YELLOW}Container: $container_name${NC}"
    
    # Check if container exists
    if [ -z "$status" ]; then
        echo -e "  ${RED}ERROR: Container does not exist!${NC}"
        return 1
    fi
    
    # Display status with color
    if [ "$status" == "running" ]; then
        echo -e "  Status: ${GREEN}$status${NC}"
    else
        echo -e "  Status: ${RED}$status${NC}"
    fi
    
    # Display health status with color
    if [ "$health" != "no-healthcheck" ]; then
        if [ "$health" == "healthy" ]; then
            echo -e "  Health: ${GREEN}$health${NC}"
        elif [ "$health" == "starting" ]; then
            echo -e "  Health: ${YELLOW}$health${NC}"
        elif [ "$health" == "unhealthy" ]; then
            echo -e "  Health: ${RED}$health${NC}
  $(docker logs --tail 10 "$container_name" 2>&1 | sed 's/^/  /')"
        else
            echo -e "  Health: $health"
        fi
    fi
    
    # Check exit code for exited containers
    if [ "$status" == "exited" ]; then
        echo -e "  ${RED}Exit Code: $exit_code${NC}"
        echo -e "  ${YELLOW}Last 10 lines of logs:${NC}"
        docker logs --tail 10 "$container_name" 2>&1 | sed 's/^/  /'
    fi
    
    # Return error if container is not running or unhealthy
    if [ "$status" != "running" ]; then
        echo -e "  ${RED}ERROR: Container is not running!${NC}"
        return 1
    fi
    
    # For containers with health checks, verify they're healthy
    if [ "$health" != "no-healthcheck" ] && [ "$health" != "healthy" ]; then
        # For backend, show more details
        if [[ "$container_name" == *"backend"* ]]; then
            echo -e "  ${YELLOW}Backend logs:${NC}"
            docker logs --tail 10 "$container_name" 2>&1 | sed 's/^/  /'
        fi
        return 1
    fi
    
    # Special checks for specific containers
    if [[ "$container_name" == *"caddy"* ]]; then
        echo -e "  ${GREEN}Caddy is running and serving traffic${NC}"
    fi
    
    if [[ "$container_name" == *"postgres"* ]]; then
        # Check if PostgreSQL is accepting connections
        if docker exec "$container_name" pg_isready -U postgres &>/dev/null; then
            echo -e "  ${GREEN}PostgreSQL is accepting connections${NC}"
        else
            echo -e "  ${RED}PostgreSQL is not accepting connections!${NC}"
            return 1
        fi
    fi
    
    if [[ "$container_name" == *"redis"* ]]; then
        # Check if Redis is responding to PING
        if docker exec "$container_name" redis-cli ping | grep -q PONG; then
            echo -e "  ${GREEN}Redis is responding to PING${NC}"
        else
            echo -e "  ${RED}Redis is not responding!${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to check container ports
check_ports() {
    echo -e "\n${YELLOW}Checking exposed ports...${NC}"
    docker ps --format '{{.Names}} -> {{.Ports}}' | sed 's/^/  /'
}

# Function to check container logs for errors
check_logs() {
    local container_name=$1
    echo -e "\n${YELLOW}Checking logs for $container_name:${NC}"
    docker logs --tail 10 "$container_name" 2>&1 | grep -i -E 'error|fail|exception|warn|timeout' | sed 's/^/  /' | tail -n 10
}

# Get all container names
CONTAINERS=$(docker ps --format '{{.Names}}' 2>/dev/null | sort)

if [ -z "$CONTAINERS" ]; then
    echo -e "${RED}No containers are currently running.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Checking container status...${NC}"
echo -e "${YELLOW}============================${NC}"

ERRORS=0
CONTAINER_COUNT=0

for container in $CONTAINERS; do
    CONTAINER_COUNT=$((CONTAINER_COUNT + 1))
    if ! check_container "$container"; then
        ERRORS=$((ERRORS + 1))
        check_logs "$container"
    fi
done

# Check ports
check_ports

# Display summary
echo -e "\n${YELLOW}Summary:${NC}"
echo -e "${YELLOW}========${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All $CONTAINER_COUNT containers are running and healthy!${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS container(s) with issues out of $CONTAINER_COUNT total containers.${NC}"
    echo -e "\n${YELLOW}To view logs for a specific container, run:${NC}"
    echo "  docker logs <container_name>"
    echo -e "\n${YELLOW}To restart all services:${NC}"
    echo "  docker-compose down && docker-compose up -d"
    exit 1
fi
