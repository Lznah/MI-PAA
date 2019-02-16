#!/bin/bash
for i in 0.{1..9};
do
  node ../../index.js genetic "./inst/"$i".dat";
done;
