#!/bin/bash
for i in 0.{1..9};
do
  node ../../index.js dynamic "./inst/"$i".dat";
done;
