#!/bin/bash
for i in {10,100,1000,10000,100000};
do
  ../../knapgen/knapgen -n 50 -N 50 -m 0.5 -W 1000 -C $i -k 1 -d 0 > "./inst/"$i".dat"
done;
