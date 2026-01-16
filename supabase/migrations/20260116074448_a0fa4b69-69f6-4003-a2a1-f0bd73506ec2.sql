-- Fix 1: Add INSERT policy for user_roles (critical for signup)
CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Fix 2: Add admin SELECT policy for orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Add admin UPDATE policy for orders
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 4: Add admin DELETE policy for products
CREATE POLICY "Admins can delete any product"
ON public.products
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));