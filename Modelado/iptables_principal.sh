#!/bin/bash -x

IPTABLES=/sbin/iptables

reglasGenerales() {

  case $1 in
  start)

    #REGLAS INICIALES
    $IPTABLES -P FORWARD ACCEPT
    $IPTABLES -P INPUT ACCEPT
    $IPTABLES -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
    $IPTABLES -A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
    $IPTABLES -A OUTPUT -m state --state RELATED,ESTABLISHED -j ACCEPT

    #PERMISOS GENERALES
    $IPTABLES -A INPUT -d 192.168.4.1 -p tcp --dport 22 -j ACCEPT -m comment --comment "ACCEPT SHH RED FRVM"
    $IPTABLES -A FORWARD -p udp --dport 123 -j ACCEPT -m comment --comment "ACCEPT NTP EN TODA LA RED"

    #REGLAS DNS INTERNO
    $IPTABLES -A INPUT -d 192.168.4.1 -p udp --dport 53 -j ACCEPT -m comment --comment "DNS INTERNO FRVM"

    #REGLAS BIND
    $IPTABLES -A INPUT -p udp --dport 53 -j ACCEPT
    $IPTABLES -A INPUT -p tcp --dport 53 -j ACCEPT
    $IPTABLES -A OUTPUT -p udp --sport 53 -j ACCEPT
    $IPTABLES -A OUTPUT -p tcp --sport 53 -j ACCEPT
    $IPTABLES -A FORWARD -p udp --sport 53 -j ACCEPT
    $IPTABLES -A FORWARD -p tcp --sport 53 -j ACCEPT

    #BIND9 A PROXY REVERSE 192.168.4.9 = proxy reverse
    $IPTABLES -t nat -A PREROUTING -d 190.123.90.99 -p tcp --dport 443 -j DNAT --to-destination 192.168.4.9:443
    $IPTABLES -A FORWARD -d 190.123.90.99 -o ens18 -d 192.168.4.9 -p tcp --dport 443 -j ACCEPT
    $IPTABLES -t nat -A PREROUTING -d 190.123.90.99 -p tcp --dport 80 -j DNAT --to-destination 192.168.4.9:80
    $IPTABLES -A FORWARD -i 190.123.90.99 -o ens18 -d 192.168.4.9 -p tcp --dport 80 -j ACCEPT -m comment

    #REGLAS CONECTIVIDAD INTERNET
    $IPTABLES -A FORWARD -o ens20 -p tcp -m multiport --dports 53,80,82,443,8081 -j ACCEPT -m comment --comment "ACCEPT NAVEGAR POR INTERNET"
    $IPTABLES -A FORWARD -o ens20 -p tcp --dport 5222 -j ACCEPT -m comment --comment "ACCEPT WHATSAPP"
    $IPTABLES -A FORWARD -o ens20 -p tcp -m multiport --dports 4244,5222,5223,5228,5242,50318,59234 -j ACCEPT -m comment --comment "ACCEPT WHATSAPP"
    $IPTABLES -A FORWARD -o ens20 -p udp -m multiport --dports 3478,45395,50318,59234 -j ACCEPT -m comment --comment "ACCEPT WHATSAPP"
    $IPTABLES -t nat -A POSTROUTING -o ens20 -j MASQUERADE -m comment --comment "SALIR A INTERNET CON IP PUBLICA"

    #REGLAS PROXY REVERSE
    #	$IPTABLES -t nat -I PREROUTING -d 190.123.90.100 -j DNAT --to-destination 192.168.5.2
    #	$IPTABLES -t nat -I POSTROUTING -s 192.168.5.2 -j SNAT --to 190.123.90.100
    #	$IPTABLES -t nat -I PREROUTING -d 190.123.90.99 -j DNAT --to-destination 192.168.5.2
    #	$IPTABLES -t nat -I POSTROUTING -s 192.168.5.2 -j SNAT --to 190.123.90.99
    #	$IPTABLES -A FORWARD -d 192.168.5.2 -j ACCEPT

    #SAMBA
    $IPTABLES -A FORWARD -d 192.168.4.37 -j ACCEPT -m comment --comment "ACCEPT SAMBA RED FRVM"
    $IPTABLES -A INPUT -s 192.168.4.37 -j ACCEPT -m comment --comment "ACCEPT SAMBA A FIREWALL"

    #KMS ONLINE
    $IPTABLES -A FORWARD -o ens20 -d 185.86.180.36 -j ACCEPT -m comment --comment "PERMITIR ACTIVAR WINDOWS Y OFFICE"
    $IPTABLES -A FORWARD -o ens20 -d 119.28.13.109 -j ACCEPT -m comment --comment "PERMITIR ACTIVAR WINDOWS Y OFFICE"
    $IPTABLES -A FORWARD -o ens20 -d 193.29.63.133 -j ACCEPT -m comment --comment "PERMITIR ACTIVAR WINDOWS Y OFFICE"
    $IPTABLES -A FORWARD -o ens20 -d 121.196.29.254 -j ACCEPT -m comment --comment "PERMITIR ACTIVAR WINDOWS Y OFFICE"
    $IPTABLES -A FORWARD -o ens20 -d 119.28.13.109 -j ACCEPT -m comment --comment "PERMITIR ACTIVAR WINDOWS Y OFFICE"

    #ICMP
    $IPTABLES -A FORWARD -p icmp -j ACCEPT -m comment --comment "PING ENTRE REDES"
    $IPTABLES -A INPUT -p icmp -j ACCEPT -m comment --comment "PING AL FIREWALL"
    $IPTABLES -A OUTPUT -p icmp -j ACCEPT -m comment --comment "PING DESDE EL FIREWALL"

    #REGLAS INPUT FIREWALL
    $IPTABLES -A INPUT -i ens20 -p udp --dport 1195 -j ACCEPT -m comment --comment "ACCEPT OPENVPN A FIREWALL"

    #REGLAS VPN
    $IPTABLES -A INPUT -i tun0 -s 10.8.0.0/24 -p upd --dport 53 -j ACCEPT

    #VLAN 4 - ADMINISTRACION
    $IPTABLES -A FORWARD -i ens18 -s 192.168.4.0/24 -j ACCEPT -m comment --comment "ACCESO TOTAL RED ADMINISTRACION"
    $IPTABLES -A INPUT -i ens20 -p tcp --dport 943 -j ACCEPT
    $IPTABLES -A INPUT -i ens20 -p udp --dport 1194 -j ACCEPT
    $IPTABLES -A FORWARD -i tun+ -j ACCEPT
    $IPTABLES -A OUTPUT -o tun+ -j ACCEPT
    $IPTABLES -A FORWARD -i ens20 -o ens18 -d 192.168.4.1 -p tcp --dport 943 -j ACCEPT -m comment --comment "ACCEPT OPENVPN DESDE AFUERA"
    $IPTABLES -A FORWARD -i ens18 -s 192.168.4.49 -o ens607 -d 192.168.60.26 -j ACCEPT -m comment --comment "ACCEPT ACTIVE DIRECTORY A 60.26"
    $IPTABLES -A FORWARD -s 192.168.4.0/24 -p tcp -m multiport --dports 8080,8443,8079,8880,8843,6789,27117 -j ACCEPT -m comment --comment "UNIFI"

    #SYSADMIN
    $IPTABLES -i FORWARD -d dsi5.red.utn.edu.ar -j ACCEPT

    #VLAN10 - ADMINISTRACION NUEVA
    $IPTABLES -A FORWARD -i ens18 -s 192.168.10.0/24 -o ens18 -d 192.168.4.49 -j ACCEPT -m comment --comment "ACCEPT RED10 A ACTIVE DIRECTORY"
    $IPTABLES -A FORWARD -i vlan10 -s 192.168.10.0/24 -o vlan607 -d 192.168.60.26 -j ACCEPT -m comment --comment "REGLA PARA PODER VER LOS ARCHIVOS DE EXPEDIENTES"
    $IPTABLES -A FORWARD -i vlan10 -s 192.168.10.0/24 -o ens18 -d 192.168.4.50 -j ACCEPT -m comment --comment "ACCEPT RED10 A 4.50"

    #VLAN 140 - ALA4

    #PANEL SOLAR
    $IPTABLES -A FORWARD -m mac --mac-source 00:03:ac:18:4e:17 -j ACCEPT
    $IPTABLES -A FORWARD -i vlan140 -s 192.168.140.18 -o vlan140 -d 192.168.140.19 -j ACCEPT

    #VLAN 130 - SISTEMAS

    #VLAN 170 - TELEFONIA
    $IPTABLES -A FORWARD -i vlan170 -s 192.168.170.10 -o ens20 -j ACCEPT
    $IPTABLES -A FORWARD -i vlan170 -s 192.168.170.10 -o ens19 -d 192.168.50.2 -j ACCEPT -m comment --comment "ACCEPT ISSABEL A CORREO"

    #VLAN 305 - RED ELECTRONICA
    $IPTABLES -A FORWARD -i vlan304 -s 192.168.104.0/24 -o ens18 -d 192.168.4.49 -j ACCEPT -m --comment "ACCEPT RED ELECTRONICA A ACTIVE DIRECTORY"

    # preguntar si esta sigue sirviendo
    $IPTABLES -I FORWARD -s 192.168.104.0/24 -d 192.168.4.49 -j ACCEPT -m comment --comment "Red electronica a 4.49"

    #VLAN 501 - CORREO
    $IPTABLES -A FORWARD -m mac --mac-source 18:46:17:fb:53:df -p tcp --dport 21 -d 192.168.50.14 -j ACCEPT -m comment --comment "FTP - TABLET"
    # Desde el correo hacia la base de datos
    $IPTABLES -I FORWARD -s 192.168.50.2 -d 192.168.50.6 -p tcp --dport 5432 -j ACCEPT
    $IPTABLES -I FORWARD -s 192.168.50.14 -d 192.168.50.6 -p tcp --dport 5432 -j ACCEPT

    #VLAN 602 - WEBFRVM
    $IPTABLES -A FORWARD -i vlan602 -s 192.168.60.6 -o vlan502 -d 192.168.50.6 -p tcp --dport 3333 -j ACCEPT #PREGUNTAR PARA QUE ES

    #VLAN 607 - WIN SERVER 2008 DB Sysacad Sysadmin Dasuten

    #VLAN 608 - DEPORTE UTN
    $IPTABLES -A FORWARD -o vlan608 -d 192.168.60.30 -p tcp -m multiport --dports 20,21,8080,65530:65535 -j ACCEPT

    #VLAN 611 - BOLSA DE TRABAJO
    $IPTABLES -A FORWARD -i vlan611 -s 192.168.60.42 -o vlan501 -d 192.168.50.2 -j ACCEPT

    #VLAN 624 - METABASE
    $IPTABLES -A FORWARD -i vlan624 -s 192.168.60.94 -j ACCEPT #AGREGAR LAS IP DE LAS DB

    # ------------------ Todo esto es nuevo y a chequear -------------------------------

    #Redireccion para sistemas operativos debian
    $IPTABLES -t nat -I PREROUTING -i vlan701 -d 190.105.208.91 -p tcp -m multiport --dports 80,443 -j DNAT --to-destination 192.168.60.18
    $IPTABLES -t nat -I PREROUTING -i vlan701 -d 190.105.208.90 -p tcp --dport 2222 -j DNAT --to-destination 192.168.60.66:22 -m comment --comment "Acceso a Debian Sistemas Operativos"
    $IPTABLES -t nat -I PREROUTING -i vlan701 -d 190.105.208.91 -p tcp --dport 46792 -j DNAT --to-destination 192.168.60.18:22
    $IPTABLES -t nat -I POSTROUTING -s 192.168.60.18 -o vlan701 -j SNAT --to 190.105.208.91

    #server correo
    $IPTABLES -A FORWARD -d 192.168.50.2 -p tcp --dport 465 -j ACCEPT
    $IPTABLES -A FORWARD -d 192.168.50.2 -p tcp --dport 466 -j ACCEPT
    $IPTABLES -A FORWARD -s 192.168.50.2 -p tcp --dport 25 -j ACCEPT
    $IPTABLES -A FORWARD -d 192.168.50.2 -p tcp --dport 995 -j ACCEPT
    $IPTABLES -A FORWARD -d 192.168.50.2 -p tcp --dport 993 -j ACCEPT
    #extension
    $IPTABLES -A FORWARD -d 192.168.50.10 -p tcp --dport 80 -j ACCEPT
    #slx02
    $IPTABLES-A FORWARD -d 192.168.50.14 -p tcp --dport 65530:65535 -j ACCEPT

    #vlan WEBFRVM
    $IPTABLES -A FORWARD -d 192.168.60.6 -p tcp --dport 50000:50100 -j ACCEPT

    #Redireccion para el correo
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 80 -j DNAT --to-destination 192.168.50.14:80
    $IPTABLES -t nat -I POSTROUTING -s 192.168.50.14 ! -d 192.168.50.2 -p tcp --dport 25 -j SNAT --to 190.114.198.101
    $IPTABLES -t nat -I POSTROUTING -s 192.168.50.2 -o vlan190 -j SNAT --to 190.114.198.101
    $IPTABLES -t nat -I POSTROUTING -s 192.168.60.6 -o vlan190 -j SNAT --to 190.114.198.110
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 25 -j DNAT --to-destination 192.168.50.2
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 995 -j DNAT --to-destination 192.168.50.2
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 993 -j DNAT --to-destination 192.168.50.2
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 465 -j DNAT --to-destination 192.168.50.2

    #Correo desde webmail
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 25 -j DNAT --to-destination 192.168.50.2
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 995 -j DNAT --to-destination 192.168.50.2
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 993 -j DNAT --to-destination 192.168.50.2
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.101 -p tcp --dport 465 -j DNAT --to-destination 192.168.50.2

    #Servicios varios
    $IPTABLES -I FORWARD -p tcp --dport 443 -j ACCEPT -m comment --comment "HTTPS"
    $IPTABLES -I FORWARD -p tcp --dport 995 -j ACCEPT -m comment --comment "POP3S"
    $IPTABLES -I FORWARD -p tcp --dport 465 -j ACCEPT -m comment --comment "SMTPS"
    $IPTABLES -I FORWARD -p tcp --dport 587 -j ACCEPT -m comment --comment "SMTP Submission"
    $IPTABLES -I FORWARD -p tcp --dport 993 -j ACCEPT -m comment --comment "IMAPS"
    $IPTABLES -I FORWARD -p tcp --dport 143 -j ACCEPT -m comment --comment "IMAP"
    $IPTABLES -I FORWARD -p udp --dport 53 -j ACCEPT -m comment --comment "DNS"
    $IPTABLES -I FORWARD -p tcp --dport 53 -j ACCEPT -m comment --comment "DNS"

    # Camaras
    $IPTABLES -I FORWARD -d 192.168.160.14 -j ACCEPT
    $IPTABLES -I FORWARD -d 192.168.160.15 -j ACCEPT

    #Vlan superserver
    $IPTABLES -I FORWARD -d 192.168.60.74 -j ACCEPT
    $IPTABLES -I FORWARD -p tcp --dport 1194 -j ACCEPT

    #Vlan metabase
    $IPTABLES -I FORWARD -s 192.168.60.94 -j ACCEPT

    #Lia Biblioteca
    $IPTABLES -I FORWARD -m mac --mac-source 00:27:0e:13:e4:4d -j ACCEPT
    $IPTABLES -I FORWARD -p tcp --dport 587 -j ACCEPT
    $IPTABLES -I FORWARD -m mac --mac-source 18:46:17:fb:53:df -p tcp --dport 65530:65535 -d 192.168.50.14 -j ACCEPT -m comment --comment "FTP - TABLET"
    $IPTABLES -I FORWARD -p tcp --dport 9101:9103 -j ACCEPT -m comment --comment "Bacula"
    $IPTABLES -I FORWARD -p tcp --sport 20 -s 192.168.50.14 -j ACCEPT -m comment --comment "FTP - TABLET"

    $IPTABLES -I INPUT -p tcp --dport 137:139 -j ACCEPT -m comment --comment "Compartido Alumno"
    $IPTABLES -I INPUT -p icmp -j ACCEPT -m comment --comment "PING"
    $IPTABLES -I INPUT -p udp --dport 53 -j ACCEPT -m comment --comment "DNS"
    $IPTABLES -I INPUT -p tcp --dport 53 -j ACCEPT -m comment --comment "DNS"
    $IPTABLES -I INPUT -p tcp --dport 67 -j ACCEPT -m comment --comment "DHCP"
    $IPTABLES -I INPUT -p udp --dport 67 -j ACCEPT -m comment --comment "DHCP"
    $IPTABLES -I INPUT -p tcp --dport 22 -j ACCEPT -m comment --comment "SSH"

    #la 0.254 no se que es y marce tampoco
    #$IPTABLES -t nat -I POSTROUTING -d 192.168.0.254 -j MASQUERADE

    $IPTABLES -I FORWARD -s 192.168.60.62 -j ACCEPT

    #UNIFI
    $IPTABLES -I INPUT -s 192.168.4.0/24 -d 192.168.4.5 -p tcp --dport 8443 -j ACCEPT
    $IPTABLES -I INPUT -s 10.5.0.0/24 -d 192.168.4.5 -p tcp --dport 8443 -j ACCEPT
    $IPTABLES -I INPUT -p udp -m multiport --dports 3478,5656,5657,5658,5659,10001,1900 -j ACCEPT
    $IPTABLES -I INPUT -p tcp -m multiport --dports 8080,8443,8079,8880,8843,6789,27117 -j ACCEPT
    $IPTABLES -I FORWARD -s 192.168.4.0/24 -p tcp -m multiport --dports 8080,8443,8079,8880,8843,6789,27117 -j ACCEPT

    #Juegos Tecnologicos / esto se deja I guess la 60.30 no existe / la 60.30 no me responde nada cuando le hago un ping
    $IPTABLES -I FORWARD -d 192.168.60.30 -p tcp -m multiport --dports 20,21,8080,65530:65535 -j ACCEPT
    $IPTABLES -t nat -I PREROUTING -s 192.168.60.30 -j ACCEPT
    $IPTABLES -t nat -I PREROUTING -d 192.168.60.30 -j ACCEPT
    $IPTABLES -I FORWARD -s 192.168.60.30 -j ACCEPT
    $IPTABLES -I FORWARD -d 192.168.60.30 -j ACCEPT
    $IPTABLES-I FORWARD -s 192.168.60.38 -j ACCEPT #Lepo
    $IPTABLES -t nat -I PREROUITNG -s 192.168.60.38 -j ACCEPT

    #Bacula Backup
    $IPTABLES -A INPUT -s 192.168.4.76 -p tcp --dport 9101:9103 -j ACCEPT -m comment --comment "Bacula Backup"

    #FTP / marce chequealo bien
    $IPTABLES -I FORWARD -p tcp --dport 21 -d 192.168.60.6 -j ACCEPT

    #webmail / Marce me hizo agregar esto pero no funciona
    # iptables -I INPUT -d 190.114.198.110 -p tcp --dport 21 -j DROP

    # Ni Marce ni yo entendemos que hace :D
    # iptables -A INPUT -p tcp --syn --dport 80 -m connlimit --connlimit-above 30 -j DROP
    # iptables -A INPUT -p tcp --syn --dport 443 -m connlimit --connlimit-above 30 -j DROP

    #Redireccion para WebService
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.55 -j DNAT --to-destination 192.168.60.22
    $IPTABLES -t nat -I POSTROUTING -s 192.168.60.22 -o vlan190 -j SNAT --to 190.114.198.55
    #Redireccion para la Web
    $IPTABLES -A FORWARD -p tcp --dport 53 -j ACCEPT #Para la transferencia de la zona
    $IPTABLES -A FORWARD -p udp --dport 53 -j ACCEPT

    #Regla que solo sabe lo que hace el Marce / no se que nombre ponerle
    $IPTABLES -I FORWARD -s 192.168.10.0/24 -d 192.168.4.50 -j ACCEPT
    $IPTABLES -I FORWARD -s 192.168.4.50 -d 192.168.10.0/24 -j ACCEPT
    $IPTABLES -I FORWARD -s 192.168.10.0/24 -d 192.168.4.49 -j ACCEPT
    $IPTABLES -I FORWARD -s 192.168.4.50 -d 192.168.10.0/24 -j ACCEPT
    p tcp --dport 10001 -j DNAT --to-destination 192.168.160.15:8000

    #Redireccion para mincyt / esto tambien chequear si se usa
    # $IPTABLES -t nat -I PREROUTING -d 190.114.198.102 -p tcp --dport 80 -j DNAT --to-destination 192.168.4.160

    #Para el sistema web de las becas SAE / chequear si se sigue usando si no borrar
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.107 -p tcp --dport 80 -j DNAT --to-destination 192.168.4.8:8080
    $IPTABLES -t nat -I POSTROUTING -s 192.168.4.8 -o vlan190:7 -j SNAT --to 190.114.198.107

    #Telefonia IP
    $IPTABLES -t nat -I PREROUTING -d 190.105.208.94 -p udp --dport 5060 -j DNAT --to-destination 192.168.170.10
    $IPTABLES -t nat -I PREROUTING -d 190.105.208.94 -p tcp --dport 5060 -j DNAT --to-destination 192.168.170.10
    $IPTABLES-t nat -I POSTROUTING -s 192.168.170.10 -o vlan701 -j SNAT --to 190.105.208.94

    #REDIRECCIONES EXTENSION
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.106 -j DNAT --to-destination 192.168.50.10
    $IPTABLES -t nat -I POSTROUTING -s 192.168.50.10 -j SNAT --to 190.114.198.106

    #Esta no se que es
    $IPTABLES -t nat -I PREROUTING -d 190.105.208.90 -p tcp --dport 51222 -j DNAT --to-destination 192.168.60.74:22

    #  esto va hacia el web slx02 desde el webmail
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.100 -p tcp --dport 21 -j DNAT --to-destination 192.168.50.14:21
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.100 -p tcp --dport 80 -j DNAT --to-destination 192.168.50.14:80

    # web pagina nueva 2014
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.110 -p tcp --dport 80 -j DNAT --to-destination 192.168.60.6:80
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.110 -p tcp --dport 443 -j DNAT --to-destination 192.168.60.6:443

    $IPTABLES -t nat -I PREROUTING -d 190.114.198.100 -p tcp --dport 53 -j DNAT --to-destination 192.168.50.14:53
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.100 -p udp --dport 53 -j DNAT --to-destination 192.168.50.14:53
    $IPTABLES -t nat -I PREROUTING -d 190.105.208.90 -p tcp --dport 53 -j DNAT --to-destination 192.168.50.14:53
    $IPTABLES -t nat -I PREROUTING -d 190.105.208.90 -p udp --dport 53 -j DNAT --to-destination 192.168.50.14:53

    $IPTABLES -t nat -I PREROUTING -d 190.114.198.100 -p tcp --dport 443 -j DNAT --to-destination 192.168.50.14:443
    $IPTABLES -t nat -A PREROUTING -d 190.114.198.101 -p tcp --dport 443 -j DNAT --to-destination 192.168.50.14:443
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.110 -p tcp --dport 21 -j DNAT --to-destination 192.168.60.6
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.110 -p tcp --dport 20 -j DNAT --to-destination 192.168.60.6
    $IPTABLES -t nat -I PREROUTING -d 190.114.198.100 -p tcp --dport 65530:65535 -j DNAT --to-destination 192.168.50.14

    $IPTABLES -t nat -I PREROUTING -d 190.114.198.110 -p tcp --dport 50000:50100 -j DNAT --to-destination 192.168.60.6

    ;;
  stop)
    $IPTABLES -P INPUT ACCEPT
    $IPTABLES -P FORWARD ACCEPT
    $IPTABLES -F INPUT
    $IPTABLES -F FORWARD
    $IPTABLES -t nat -F PREROUTING
    $IPTABLES -t nat -F POSTROUTING
    ;;
  esac
}
case $1 in
start)
  reglasGenerales start
  ;;
stop)
  reglasGenerales stop
  ;;
restart)
  reglasGenerales stop
  reglasGenerales start
  ;;
*)
  echo "Usar {start|stop|restart}"
  ;;
esac
