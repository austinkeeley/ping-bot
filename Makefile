# Makefile for the wrapper
# The wrapper target is going to prompt you for your root password 
# so don't run this if you are set to do stuff non-interactively.

BIN_NAME=ping-bot-wrapper

THIS_DIR = $(shell pwd)
DEFINES=-DPING_AGENT_PATH="\"$(THIS_DIR)\""

$(BIN_NAME): wrapper.o
	gcc -o $@ $^
	sudo chown root $(BIN_NAME)
	sudo chmod u+s $(BIN_NAME)

%.o: %.c
	gcc -c $(DEFINES) $<

clean:
	rm -f $(BIN_NAME)
	rm -f *.o
