<script lang="ts">
  import {
    BadgeDollarSign, Bell, BookOpen, Briefcase, ClipboardList, Clock3,
    CreditCard, FileCheck, GraduationCap, Grid2X2, Heart, Home,
    LifeBuoy, Mail, Map, Settings, Shield, Star, User, Utensils
  } from 'lucide-svelte'

  const iconRegistry: Record<string, typeof Home> = {
    BadgeDollarSign, Bell, BookOpen, Briefcase, ClipboardList, Clock3,
    CreditCard, FileCheck, GraduationCap, Grid2X2, Heart, Home,
    LifeBuoy, Mail, Map, Settings, Shield, Star, User, Utensils,
  }

  interface Props {
    name?: string
    class?: string
  }

  let { name, class: className = 'h-5 w-5' }: Props = $props()

  const Icon = $derived(iconRegistry[name || 'Grid2X2'] || Grid2X2)
</script>

<Icon class={className} />
