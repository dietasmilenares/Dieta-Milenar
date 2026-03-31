import React from 'react';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useData } from '../context/DataContext';

const NOMES = ['Abel','Abílio','Adauto','Adelaide','Adelino','Ademar','Ademir','Adonias','Adriana','Adriano','Afonso','Agenor','Agostinho','Agripina','Alair','Alan','Albano','Albertina','Alberto','Albino','Alcides','Alcindo','Aldo','Alex','Alexandre','Alfeu','Alfredo','Alice','Aline','Almir','Aloísio','Aluísio','Alvaro','Amadeu','Amanda','Amaro','Amâncio','Amélia','Américo','Amílcar','Ana','Anacleto','Anastácio','Anatólio','Anderson','André','Andréia','Anita','Anselmo','Antenor','Antero','Antônia','Antônio','Anunciada','Anália','Aníbal','Aparecida','Apolinário','Aquiles','Arcanjo','Ari','Aristeu','Aristides','Armando','Arnaldo','Arthur','Artur','Assunção','Astolfo','Atílio','Augusta','Augusto','Aureiliano','Aureliano','Aurora','Aurélio','Avelino','Azarias','Balduíno','Baltazar','Bartolomeu','Basílio','Beatriz','Belarmino','Belisário','Belmiro','Benedita','Benedito','Benigna','Benjamim','Bento','Berenice','Bernadete','Bernardino','Bernardo','Berto','Bianca','Bonifácio','Breno','Bruna','Bruno','Brás','Bárbara','Caetano','Caio','Camila','Camilo','Capitulino','Carlito','Carlos','Carmelo','Carolina','Casemiro','Cassiano','Castelo','Castor','Catarino','Cecília','Celina','Celso','Cipriano','Cirilo','Ciro','Clarice','Claudino','Claudio','Cleide','Clemente','Clodoaldo','Cláudia','Cláudio','Clóvis','Constantino','Cora','Cosme','Cremilda','Crispim','Cristiane','Cristóvão','Custódio','Cássio','Cândida','Cândido','Célio','César','Cícero','Cíntia','Daiane','Dalmiro','Dalmo','Dalva','Damaso','Damião','Daniel','Daniela','Danilo','Darci','Davi','Delfim','Delfino','Demétrio','Denilson','Deodato','Deodoro','Deolinda','Desidério','Diego','Dina','Dinorá','Dionísio','Dirce','Diva','Djalma','Djalmir','Djalmo','Djalmy','Domingos','Donatila','Dora','Doralice','Doris','Douglas','Dulce','Dário','Débora','Décio','Edelmira','Edite','Edmundo','Edna','Edson','Eduardo','Eglantina','Eliane','Elias','Eliseu','Elmira','Elvira','Elza','Ema'];
const SOBRENOMES = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Soares','Fernandes','Vieira','Barbosa','Rocha','Dias','Nascimento','Andrade','Moreira','Nunes','Marques','Machado','Mendes','Freitas','Cardoso','Ramos','Santana','Teixeira','Castro','Cavalcante','Pinheiro','Borges','Moraes','Rezende','Viana','Sales','Guimarães','Araujo','Barros','Correia','Cunha','Duarte','Fonseca','Garcia','Jorge','Leite','Macedo','Maia','Melo','Miranda','Monteiro','Neves','Pacheco','Paiva','Prado','Queiroz','Reis','Siqueira','Tavares','Vasconcelos','Xavier','Aguiar','Amaral','Assis','Batista','Bezerra','Branco','Brito','Camargo','Campos','Chaves','Clementino','Coelho','Correa','Cruz','Dantas','Delgado','Domingues','Enes','Escobar','Esteves','Farias','Felício','Figueiredo','Fontes','Fortes','Fragoso','Franco','Furtado','Galvão','Gaspar','Gentil','Godoy','Gouveia','Guerra','Gusmão','Henriques','Hipólito','Holanda','Horta','Ibiapina','Inácio','Jardim','Junqueira','Lacerda','Lages','Lemos','Linhares','Lins','Lira','Loyola','Lucena','Lustosa','Luz','Magalhães','Malafaia','Malta','Marinho','Mattos','Medeiros','Meireles','Mesquita','Meirelles','Mello','Mendonça','Menezes','Milhomem','Modesto','Montenegro','Morais','Mota','Motta','Moura','Muniz','Negrão','Negreiros','Neto','Nobre','Nóbrega','Nogueira','Novaes','Novais','Ornellas','Orta','Osório','Paes','Paixão','Pantoja','Paranhos','Parga','Pascoal','Passos','Paz','Peçanha','Peixoto','Penha','Penido','Penteado','Perdigão','Pessoa','Pimentel','Pimenta','Pina','Pineda','Pinto','Pires','Pontes','Portela','Porto','Portugal','Pousa','Pozzo','Prates','Prestes','Proença','Prudente','Quadros','Quaresma','Queirós','Quintana','Quintanilha','Quintela','Rabelo','Rabello','Ramalho','Ramires','Rangel','Raposo','Rebelo','Rego','Resende','Rezek','Ribas','Rios'];

const ACOES = [
  'acabou de se cadastrar',
  'acabou de adquirir o programa',
  'entrou para o grupo',
  'está visualizando agora',
  'acabou de iniciar o programa',
  'acabou de garantir sua vaga',
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gerarNome(): string {
  const nome = rand(NOMES);
  const sob  = rand(SOBRENOMES);
  return `${nome} ${sob.charAt(0)}.`;
}

// CSS de animação injetado globalmente uma vez
const injectCSS = () => {
  if (document.getElementById('sp-anim')) return;
  const style = document.createElement('style');
  style.id = 'sp-anim';
  style.textContent = `
    @keyframes gn-slide-in {
      from { transform: translateX(-110%); opacity: 0; }
      to   { transform: translateX(0);     opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};

export const SocialProofOverlay: React.FC = () => {
  const { isMemberNotificationsEnabled } = useData();
  injectCSS();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isMemberNotificationsEnabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const schedule = () => {
      // intervalo aleatório entre 8s e 22s
      const delay = 22000 + Math.random() * 38000;
      timerRef.current = setTimeout(() => {
        const nome  = gerarNome();
        const acao  = rand(ACOES);
        toast(`🟢 ${nome} ${acao}`, {
          duration: 5000,
          position: 'top-left',
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
            fontSize: '13px',
            maxWidth: '280px',
          },
          icon: undefined,
        });
        schedule();
      }, delay);
    };

    // Primeira notificação após 12s
    timerRef.current = setTimeout(() => {
      const nome = gerarNome();
      const acao = rand(ACOES);
      toast(`🟢 ${nome} ${acao}`, {
        duration: 5000,
        position: 'top-left',
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
          fontSize: '13px',
          maxWidth: '280px',
          animation: 'gn-slide-in 0.4s ease forwards',
        },
        icon: undefined,
      });
      schedule();
    }, 12000);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isMemberNotificationsEnabled]);

  return null;
};
