/*
 * wrapper.c
 * Wrapper around the ping-agent.js.
 * It is stupid dangerous to run setuid so this requires you to 
 * set the explicit path at compile time with a -D flag. 
 */

#ifndef PING_AGENT_PATH
#error you forgot to set the PING_AGENT_PATH
#endif

#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

const char *PATH = PING_AGENT_PATH "/ping-bot.js";
char *ARGS[] = {"ping-bot.js"};

int main(int argc, char *argv) {
	printf("Ping agent wrapper\n");
	printf("Path: %s\n", PATH);

	// Are we running this with setuid?  If not, we probably
	// messed something up.
	uid_t real_uid = getuid();
	uid_t effective_uid = geteuid();
	printf("Real UID: %d\n", real_uid);
	printf("Effective UID: %d\n", effective_uid);
	if (0 != effective_uid) {
		fprintf(stderr, "WARNING: Not running as root\n");
	}

	execv(PATH, ARGS);

	return 0;

}
