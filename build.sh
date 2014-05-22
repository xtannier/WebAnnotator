#!/bin/sh

XPI_NAME=webannotator-1.17.xpi

(cd xpi && zip -q -r "../$XPI_NAME" .)
