#!/usr/bin/ruby

# returns 1 if a number is prime, false otherwise
def is_prime?(test, primes)
  primes.each do |factor|
    return false if test % factor == 0
  end
  return true
end

primes = [2]
candidate = 3
number_to_print = ARGV[0].to_i || 100
while primes.length < number_to_print
  primes << candidate if is_prime?(candidate, primes)
  candidate += 2;
end

puts primes
