# Makefile for the wrapper
# The wrapper target is going to prompt you for your root password 
# so don't run this if you are set to do stuff non-interactively.

THIS_DIR = $(shell pwd)
DEFINES=-DPING_AGENT_PATH="\"$(THIS_DIR)\""

wrapper: wrapper.o
	gcc -o wrapper wrapper.c $(DEFINES)
	sudo chown root wrapper
	sudo chmod u+s wrapper

%.o: %.c
	gcc -c $(DEFINES) $<

clean:
	rm -f wrapper
	rm -f *.o
