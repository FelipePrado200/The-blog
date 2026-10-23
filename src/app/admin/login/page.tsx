'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGitHubSignIn() {
    setIsLoading(true);
    await signIn('github', {
      redirectTo: '/admin/posts',
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCFB] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#16161A] mb-2">
            The Blog
          </h1>
          <p className="text-[#55555C]">Painel de Administração</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E6E5E1] rounded-[14px] p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#16161A] mb-2">
              Faça login para continuar
            </h2>
            <p className="text-sm text-[#55555C]">
              Apenas contas autorizadas têm acesso ao painel.
            </p>
          </div>

          {/* GitHub OAuth Button */}
          <button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#16161A] text-white font-medium py-3 px-4 rounded-[10px] hover:bg-[#16161A]/90 disabled:opacity-50 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.49.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.46-3.37-1.46-.46-1.15-1.1-1.46-1.1-1.46-.88-.6.07-.58.07-.58.97.07 1.48.99 1.48.99.88 1.5 2.3 1.07 2.86.82.09-.64.34-1.07.62-1.32-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33s1.7.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.82-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.59.68.48C17.13 18.17 20 14.42 20 10c0-5.52-4.48-10-10-10z" />
            </svg>
            {isLoading ? 'Conectando...' : 'Continuar com GitHub'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6E5E1]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#8A8A90]">ou</span>
            </div>
          </div>

          {/* Email Login Form (Optional - pode ser desabilitado) */}
          <form className="space-y-4 opacity-50 pointer-events-none">
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-2.5 border border-[#E6E5E1] rounded-[8px] text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE]"
              disabled
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-2.5 border border-[#E6E5E1] rounded-[8px] text-[#16161A] placeholder-[#8A8A90] focus:outline-none focus:ring-2 focus:ring-[#4B3FBE]"
              disabled
            />
            <button
              type="submit"
              className="w-full bg-[#4B3FBE] text-white font-medium py-2.5 rounded-[8px] hover:bg-[#3d328a] transition-colors"
              disabled
            >
              Entrar
            </button>
          </form>

          {/* Info */}
          <div className="bg-[#F7F7F5] rounded-[8px] p-4 text-xs text-[#55555C]">
            <p className="font-medium mb-1">ℹ️ Nota</p>
            <p>
              O blog permanece aberto para todos os visitantes. Apenas o painel
              administrativo requer autenticação.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-[#4B3FBE] hover:underline">
            ← Voltar ao blog
          </Link>
        </div>
      </div>
    </div>
  );
}
