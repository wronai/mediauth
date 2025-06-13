#!/bin/bash

# Install Ansible if not installed
if ! command -v ansible &> /dev/null; then
    echo "Installing Ansible..."
    sudo apt update
    sudo apt install -y ansible
fi

# Install required Ansible collections
echo "Installing required Ansible collections..."
ansible-galaxy collection install -r ansible/requirements.yml

# Run the health check playbook
echo "Running container health checks..."
ansible-playbook ansible/check_docker_health.yml -i localhost, -c local

# Check the exit status of the playbook
if [ $? -eq 0 ]; then
    echo -e "\nAll containers are healthy!"
else
    echo -e "\nSome containers are not healthy. Check the output above for details."
    exit 1
fi
