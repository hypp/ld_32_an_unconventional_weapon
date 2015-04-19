

OGG=$(patsubst %.wav,%.ogg,$(wildcard *.wav))
MP3=$(patsubst %.wav,%.mp3,$(wildcard *.wav))

all: $(OGG) $(MP3)

%.mp3 : %.wav
	lame $^ $@

%.ogg : %.wav
	oggenc -o $@ $^ 

