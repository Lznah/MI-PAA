#!/bin/bash
for i in 0.{1..9};
do
  ../../knapgen/knapgen -n 100 -N 100 -m 0.5 -W 1000 -C 1000 -k $i -d 0 > "./inst/"$i".dat"
done;
