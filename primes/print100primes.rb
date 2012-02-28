#!/usr/bin/ruby

# returns 1 if a number is prime, false
def is_prime?(test, primes)
  primes.each do |factor|
    return false if test % factor == 0
  end
  return true
end

primes = [2]
candidate = 3
while primes.length < 100
  primes << candidate if is_prime?(candidate, primes)
  candidate += 2;
end

puts primes
