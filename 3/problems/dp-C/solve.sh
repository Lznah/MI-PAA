#!/bin/bash
for i in {10,100,1000,10000,100000};
do
  node ../../index.js dynamic "./inst/"$i".dat";
done;
