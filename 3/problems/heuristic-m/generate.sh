#!/bin/bash
for i in 0.{1..9};
do
  ../../knapgen/knapgen -n 100 -N 100 -m $i -W 1000 -C 1000 -k 1 -d 0 > "./inst/"$i".dat"
done;
