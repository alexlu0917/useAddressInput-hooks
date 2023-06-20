import { ethers } from "ethers";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Chain, FANTOM } from "src/chain";

export interface AddressInput {
  isValid: boolean;
  input: string;
}

export interface AddressResult {
  isValid: boolean;
  address: string;
}

export function useAddressInput(
  initial: string = "",
  chain: Chain = FANTOM,
): [string, AddressInput, Dispatch<SetStateAction<string>>] {
  const [input, setInput] = useState(initial);
  const { isValid, address } = useAddressFromInput(input, chain);

  return useMemo(() => {
    return [address, { isValid, input }, setInput];
  }, [input, setInput, isValid, address]);
}

/**
 * Transform raw user input into an address of EVM.
 *
 * There are many inputs that are valid to humans but can't
 * be processed by `Address`. This method is useful for adding
 * some human-friendly leniency to the input parsing.
 *
 * You'd definitely expect commas to work in inputs, for example.
 */
function useAddressFromInput(input: string, chain: Chain): AddressResult {
  const [result, setResult] = useState<AddressResult>({
    isValid: false,
    address: "",
  });

  useEffect(() => {
    const getValidAddress = async () => {
      const value = input.trim();
      const valid = await ethers.utils.isAddress(value);
      if (valid) {
        setResult({
          isValid: true,
          address: value,
        });
      } else {
        const provider = new ethers.providers.JsonRpcProvider(chain.rpc[0]);
        try {
          const address = await provider.resolveName(input);
          setResult({ isValid: true, address: address ?? "" });
        } catch (e) {
          setResult({ isValid: false, address: "" });
        }
      }
    };

    getValidAddress();
  }, [input, chain]);

  return result;
}
