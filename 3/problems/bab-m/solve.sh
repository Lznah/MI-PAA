#!/bin/bash
for i in 0.{1..9};
do
  node ../../index.js bab "./inst/"$i".dat";
done;
