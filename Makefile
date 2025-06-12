.PHONY: run stop install uninstall clean help

# Variables
MONITOR_SCRIPT = port80_monitor.py
STOP_SCRIPT = stop_port80.sh
INSTALL_DIR = /usr/local/bin
MONITOR_NAME = port80mon
STOP_NAME = stop80

help:
	@echo "Port 80 Management Tools"
	@echo "========================"
	@echo "  make run     - Monitor port 80 usage"
	@echo "  make stop    - Stop process on port 80"
	@echo "  make install - Install tools to $(INSTALL_DIR)"
	@echo "  make uninstall - Remove installed tools"
	@echo "  make clean   - Clean up temporary files"
	@echo "  make help    - Show this help"

run:
	sudo python3 $(MONITOR_SCRIPT)

stop:
	sudo ./$(STOP_SCRIPT)

install:
	@echo "Installing monitor script to $(INSTALL_DIR)/$(MONITOR_NAME)"
	sudo cp $(MONITOR_SCRIPT) $(INSTALL_DIR)/$(MONITOR_NAME)
	sudo chmod +x $(INSTALL_DIR)/$(MONITOR_NAME)
	
	@echo "\nInstalling stop script to $(INSTALL_DIR)/$(STOP_NAME)"
	sudo cp $(STOP_SCRIPT) $(INSTALL_DIR)/$(STOP_NAME)
	sudo chmod +x $(INSTALL_DIR)/$(STOP_NAME)
	
	@echo "\nInstallation complete! You can now use:"
	@echo "  sudo $(MONITOR_NAME)  - Monitor port 80"
	@echo "  sudo $(STOP_NAME)     - Stop process on port 80"

uninstall:
	@echo "Removing installed tools..."
	@for script in $(MONITOR_NAME) $(STOP_NAME); do \
		if [ -f "$(INSTALL_DIR)/$$script" ]; then \
			sudo rm -f "$(INSTALL_DIR)/$$script" && \
			echo "Removed $(INSTALL_DIR)/$$script"; \
		else \
			echo "$$script not found in $(INSTALL_DIR)"; \
		fi; \
	done

clean:
	@echo "Cleaning up..."
	@find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	@find . -type f -name "*.py[co]" -delete -o -type d -name "__pycache__" -delete
	@echo "Done."
