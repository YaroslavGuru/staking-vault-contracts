# Code Review Guide

## 🔍 Review Checklist

### 1. Architecture & Code Structure

#### ✅ Check:
- [ ] Next.js 14 App Router structure is correct
- [ ] Components are in `/components` directory
- [ ] Pages are in `/app` directory
- [ ] Utilities are in `/lib` directory
- [ ] Contract ABI is in `/contracts` directory
- [ ] File naming follows conventions (PascalCase for components)

#### 📝 Review Points:
- **App Router**: Verify use of App Router patterns (not Pages Router)
- **Server/Client Components**: Check `"use client"` directives are correct
- **Component Organization**: Components should be modular and reusable
- **Hook Organization**: Custom hooks in `/lib/staking.ts` are well-organized

---

### 2. TypeScript & Type Safety

#### ✅ Check:
- [ ] All files use TypeScript (`.tsx` for components, `.ts` for utilities)
- [ ] No `any` types (except where absolutely necessary)
- [ ] Props interfaces are defined
- [ ] Function return types are explicit
- [ ] Import types are correct

#### 📝 Review Points:
- **Type Definitions**: Check `Address` type from viem is used correctly
- **Contract Types**: Verify ABI types are properly imported
- **Hook Return Types**: Custom hooks should have clear return types
- **Error Types**: Error handling should be typed

#### 🔍 Example Issues to Look For:
```typescript
// ❌ Bad
const data: any = useReadContract(...)

// ✅ Good
const { data } = useReadContract<bigint>(...)
```

---

### 3. React Best Practices

#### ✅ Check:
- [ ] Hooks are used correctly (no conditional hooks)
- [ ] useEffect dependencies are complete
- [ ] State updates are handled correctly
- [ ] No unnecessary re-renders
- [ ] Memoization used where appropriate

#### 📝 Review Points:
- **Custom Hooks**: Verify hooks follow React hook rules
- **State Management**: Check useState usage is appropriate
- **Effect Cleanup**: useEffect should clean up if needed
- **Refetch Logic**: Verify refetch triggers are correct

#### 🔍 Example Issues to Look For:
```typescript
// ❌ Bad - Missing dependency
useEffect(() => {
  refetch();
}, []); // Missing dependencies

// ✅ Good
useEffect(() => {
  if (isSuccess) {
    refetch();
  }
}, [isSuccess, refetch]);
```

---

### 4. Web3 Integration

#### ✅ Check:
- [ ] Contract ABI is correct and matches deployed contract
- [ ] Contract addresses use environment variables
- [ ] Network validation is implemented
- [ ] Error handling for contract calls
- [ ] Transaction state management
- [ ] Approval flow is correct

#### 📝 Review Points:
- **Contract Calls**: Verify function names match contract
- **Parameter Types**: Check amounts are properly converted (parseEther)
- **Error Handling**: Contract errors should be caught and displayed
- **Transaction Flow**: Approval → Deposit flow should be clear
- **Network Checks**: Should validate Sepolia network

#### 🔍 Critical Checks:
```typescript
// ✅ Verify contract address is from env
const STAKING_CONTRACT = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS

// ✅ Verify amount parsing
const amount = parseEther(depositAmount) // Not just Number()

// ✅ Verify error handling
try {
  await deposit(amount);
} catch (error) {
  // Handle error
}
```

---

### 5. UI/UX Components

#### ✅ Check:
- [ ] Components are responsive
- [ ] Loading states are clear
- [ ] Error messages are user-friendly
- [ ] Disabled states are properly handled
- [ ] Dark mode works
- [ ] Accessibility (if applicable)

#### 📝 Review Points:
- **InputBox Component**: Check validation logic
- **Button States**: Loading, disabled, enabled states
- **Error Display**: Errors should be visible and actionable
- **Empty States**: What shows when no data?

#### 🔍 Example Checks:
```tsx
// ✅ Good - Clear disabled state
<button disabled={!amount || amount <= 0}>
  Deposit
</button>

// ✅ Good - Loading state
{isLoading ? "Processing..." : "Deposit"}
```

---

### 6. Performance

#### ✅ Check:
- [ ] No unnecessary re-renders
- [ ] React Query caching is used
- [ ] Refetch intervals are appropriate
- [ ] Bundle size considerations
- [ ] Code splitting (Next.js handles this)

#### 📝 Review Points:
- **Refetch Intervals**: 5s for rewards, 10s for balances (reasonable?)
- **Query Keys**: React Query keys should be unique
- **Memoization**: Should expensive calculations be memoized?
- **Bundle Size**: Check if any large dependencies

---

### 7. Security

#### ✅ Check:
- [ ] No private keys or secrets in code
- [ ] Environment variables are used correctly
- [ ] Input validation is implemented
- [ ] Transaction confirmations required
- [ ] Network validation
- [ ] Address validation

#### 📝 Review Points:
- **Env Vars**: All sensitive data should be in `.env.local`
- **Input Validation**: User inputs should be validated
- **Amount Validation**: Check for negative amounts, overflow
- **Address Validation**: Verify addresses are valid

#### 🔍 Security Checks:
```typescript
// ✅ Good - Input validation
if (val === "" || /^\d*\.?\d*$/.test(val)) {
  onChange(val);
}

// ✅ Good - Amount validation
if (!amount || amount <= 0) return;
```

---

### 8. Error Handling

#### ✅ Check:
- [ ] All async operations have error handling
- [ ] User-friendly error messages
- [ ] Network errors are handled
- [ ] Transaction failures are handled
- [ ] Loading states during errors

#### 📝 Review Points:
- **Try-Catch**: Are async operations wrapped?
- **Error Messages**: Are they clear and actionable?
- **Error States**: Are errors displayed to users?
- **Recovery**: Can users retry after errors?

---

### 9. Documentation

#### ✅ Check:
- [ ] README is comprehensive
- [ ] Code comments explain complex logic
- [ ] Architecture docs are clear
- [ ] User guide is complete
- [ ] Setup instructions work

#### 📝 Review Points:
- **README**: Should cover setup, usage, deployment
- **Code Comments**: Complex logic should be commented
- **JSDoc**: Functions should have JSDoc comments
- **Examples**: Are there usage examples?

---

### 10. Configuration Files

#### ✅ Check:
- [ ] `package.json` dependencies are correct
- [ ] `tsconfig.json` is properly configured
- [ ] `next.config.js` handles Web3 deps
- [ ] `tailwind.config.ts` is correct
- [ ] `.env.local.example` is provided

#### 📝 Review Points:
- **Dependencies**: Are all needed deps included?
- **Dev Dependencies**: Are dev-only deps in devDependencies?
- **Webpack Config**: Does it handle React Native deps?
- **TypeScript Config**: Path aliases work correctly?

---

## 🎯 Specific Code Review Points

### Contract Integration (`lib/staking.ts`)

1. **Contract Address Validation**
   ```typescript
   // ✅ Should validate address is set
   const STAKING_CONTRACT = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS
   if (!STAKING_CONTRACT) throw new Error("Contract address not set")
   ```

2. **Hook Error Handling**
   ```typescript
   // ✅ Should handle errors
   const { data, error } = useReadContract(...)
   if (error) console.error(error)
   ```

3. **Transaction Hooks**
   ```typescript
   // ✅ Should return error state
   const { writeContract, error, isPending } = useWriteContract()
   ```

### Components

1. **StakingCard.tsx**
   - [ ] Approval flow logic is correct
   - [ ] Deposit/withdraw validation
   - [ ] Refetch logic after transactions
   - [ ] Error display

2. **RewardsCard.tsx**
   - [ ] Pending rewards calculation
   - [ ] Claim button disabled when no rewards
   - [ ] Success feedback

3. **ConnectWalletButton.tsx**
   - [ ] Network switching
   - [ ] Connection states
   - [ ] Error handling

### Utils (`lib/utils.ts`)

1. **Format Functions**
   ```typescript
   // ✅ Should handle edge cases
   export function formatTokenAmount(amount: bigint | undefined): string {
     if (!amount) return "0";
     try {
       return formatEther(amount);
     } catch {
       return "0";
     }
   }
   ```

2. **Parse Functions**
   ```typescript
   // ✅ Should validate input
   export function parseTokenAmount(amount: string): bigint {
     if (!amount || amount === "") return 0n;
     try {
       return parseEther(amount);
     } catch {
       return 0n;
     }
   }
   ```

---

## 🚨 Common Issues to Watch For

### 1. Missing Error Handling
```typescript
// ❌ Bad
const deposit = async (amount: bigint) => {
  writeContract({ ... });
};

// ✅ Good
const deposit = async (amount: bigint) => {
  try {
    await writeContract({ ... });
  } catch (error) {
    console.error("Deposit failed:", error);
    // Show user-friendly error
  }
};
```

### 2. Incorrect Amount Parsing
```typescript
// ❌ Bad
const amount = Number(depositAmount) * 1e18;

// ✅ Good
const amount = parseEther(depositAmount);
```

### 3. Missing Refetch
```typescript
// ❌ Bad
useEffect(() => {
  if (isSuccess) {
    // Missing refetch
  }
}, [isSuccess]);

// ✅ Good
useEffect(() => {
  if (isSuccess) {
    refetchUserInfo();
    refetchYaroBalance();
  }
}, [isSuccess, refetchUserInfo, refetchYaroBalance]);
```

### 4. Hardcoded Values
```typescript
// ❌ Bad
const contractAddress = "0x1741b4BC78D05Cd3F5b8Db977e788047b693CFdF";

// ✅ Good
const contractAddress = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS;
```

---

## ✅ Approval Criteria

### Must Have:
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] Contract integration works correctly
- [ ] Error handling is comprehensive
- [ ] Documentation is complete
- [ ] Code follows project style

### Should Have:
- [ ] Performance is optimized
- [ ] UI/UX is polished
- [ ] Tests are added (if applicable)
- [ ] Accessibility considerations

### Nice to Have:
- [ ] Additional features
- [ ] Performance optimizations
- [ ] Enhanced error messages
- [ ] Additional documentation

---

## 📝 Review Comments Format

### Positive Feedback
```
✅ Great implementation! The approval flow is well-handled.
```

### Suggestions
```
💡 Consider adding a loading spinner during approval to improve UX.
```

### Issues
```
❌ Bug: The deposit button stays disabled after approval. 
      Should enable after approval transaction confirms.
```

### Questions
```
❓ Why is the refetch interval set to 5 seconds? 
   Could this be optimized?
```

---

## 🎯 Review Priority

### High Priority (Must Fix)
1. Security vulnerabilities
2. TypeScript errors
3. Contract integration bugs
4. Critical error handling

### Medium Priority (Should Fix)
1. Performance issues
2. Code quality improvements
3. UI/UX enhancements
4. Documentation gaps

### Low Priority (Nice to Have)
1. Code style improvements
2. Additional comments
3. Minor optimizations
4. Additional features

---

**Happy Reviewing!** 🚀

